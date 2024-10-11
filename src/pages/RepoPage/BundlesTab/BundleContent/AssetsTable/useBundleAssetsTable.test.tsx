import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Trend } from 'shared/utils/timeseriesCharts'

import { useBundleAssetsTable } from './useBundleAssetsTable'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockedBundleAssets = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              bundleData: {
                size: {
                  uncompress: 12,
                },
              },
              assetsPaginated: {
                edges: [
                  {
                    node: {
                      name: 'asset-1',
                      extension: 'js',
                      bundleData: {
                        loadTime: {
                          threeG: 1,
                          highSpeed: 2,
                        },
                        size: {
                          uncompress: 3,
                          gzip: 4,
                        },
                      },
                      measurements: {
                        change: {
                          size: {
                            uncompress: 5,
                          },
                        },
                        measurements: [
                          { timestamp: '2022-10-10T11:59:59', avg: 6 },
                        ],
                      },
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
            },
          },
        },
      },
    },
  },
}

const initialEntry = '/gh/codecov/test-repo/bundles/test-branch/test-bundle'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})
const wrapper =
  (initialEntries = initialEntry): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={'/:provider/:owner/:repo/bundles/:branch/:bundle'}>
            {children}
          </Route>
        </MemoryRouter>
      </Suspense>
    </QueryClientProvider>
  )

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useBundleAssetsTable', () => {
  function setup() {
    const queryVarMock = vi.fn()

    server.use(
      graphql.query('BundleAssets', (info) => {
        queryVarMock(info.variables)
        return HttpResponse.json({ data: mockedBundleAssets })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )

    return { queryVarMock }
  }

  it('returns the bundle assets', async () => {
    setup()

    const { result } = renderHook(
      () =>
        useBundleAssetsTable({
          provider: 'gh',
          owner: 'codecov',
          repo: 'test-repo',
          branch: 'test-branch',
          bundle: 'test-bundle',
        }),
      { wrapper: wrapper() }
    )

    const expectedResult = {
      pageParams: [undefined],
      pages: [
        {
          assets: [
            {
              bundleData: {
                loadTime: {
                  highSpeed: 2,
                  threeG: 1,
                },
                size: {
                  gzip: 4,
                  uncompress: 3,
                },
              },
              extension: 'js',
              measurements: {
                change: {
                  size: {
                    uncompress: 5,
                  },
                },
                measurements: [
                  {
                    avg: 6,
                    timestamp: '2022-10-10T11:59:59',
                  },
                ],
              },
              name: 'asset-1',
            },
          ],
          bundleData: {
            size: {
              uncompress: 12,
            },
          },
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      ],
    }
    await waitFor(() => expect(result.current.data).toEqual(expectedResult))
  })

  describe('no search params are set', () => {
    it('uses the default trend of three months', async () => {
      const { queryVarMock } = setup()

      renderHook(
        () =>
          useBundleAssetsTable({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'test-branch',
            bundle: 'test-bundle',
          }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            interval: 'INTERVAL_7_DAY',
          })
        )
      )
    })
  })

  describe('search params are set', () => {
    it('uses the trend from the search params', async () => {
      const { queryVarMock } = setup()

      const url = `${initialEntry}?${qs.stringify({ trend: Trend.SEVEN_DAYS })}`
      renderHook(
        () =>
          useBundleAssetsTable({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'test-branch',
            bundle: 'test-bundle',
          }),
        { wrapper: wrapper(url) }
      )

      await waitFor(() =>
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            interval: 'INTERVAL_1_DAY',
          })
        )
      )
    })

    it('uses the type filters from the search params', async () => {
      const { queryVarMock } = setup()

      const url = `${initialEntry}?${qs.stringify({ types: ['JAVASCRIPT'] })}`
      renderHook(
        () =>
          useBundleAssetsTable({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'test-branch',
            bundle: 'test-bundle',
          }),
        { wrapper: wrapper(url) }
      )

      await waitFor(() =>
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: { loadTypes: [], reportGroups: ['JAVASCRIPT'] },
          })
        )
      )
    })

    it('uses the load type filters from the search params', async () => {
      const { queryVarMock } = setup()

      const url = `${initialEntry}?${qs.stringify({ loading: ['INITIAL'] })}`
      renderHook(
        () =>
          useBundleAssetsTable({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'test-branch',
            bundle: 'test-bundle',
          }),
        { wrapper: wrapper(url) }
      )

      await waitFor(() =>
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: { loadTypes: ['INITIAL'], reportGroups: [] },
          })
        )
      )
    })
  })
})
