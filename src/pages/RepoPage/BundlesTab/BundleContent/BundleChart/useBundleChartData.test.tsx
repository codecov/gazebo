import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBundleChartData } from './useBundleChartData'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['typescript'],
      testAnalyticsEnabled: false,
    },
  },
}

const mockBundleTrendData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                measurements: [
                  {
                    assetType: 'JAVASCRIPT_SIZE',
                    measurements: [
                      {
                        timestamp: '2024-06-15T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-16T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-17T00:00:00+00:00',
                        avg: 10000.8,
                      },
                      {
                        timestamp: '2024-06-18T00:00:00+00:00',
                        avg: 10500,
                      },
                      {
                        timestamp: '2024-06-19T00:00:00+00:00',
                        avg: 20000,
                      },
                      {
                        timestamp: '2024-06-20T00:00:00+00:00',
                        avg: 15000,
                      },
                    ],
                  },
                  {
                    assetType: 'STYLESHEET_SIZE',
                    measurements: [
                      {
                        timestamp: '2024-06-15T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-16T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-17T00:00:00+00:00',
                        avg: 1000,
                      },
                      {
                        timestamp: '2024-06-18T00:00:00+00:00',
                        avg: 800,
                      },
                      {
                        timestamp: '2024-06-19T00:00:00+00:00',
                        avg: 900,
                      },
                      {
                        timestamp: '2024-06-20T00:00:00+00:00',
                        avg: 950,
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
}

const initialEntries = '/gh/codecov/test-repo/bundles/main/test-bundle'
const queryClient = new QueryClient()
const wrapper =
  (entries = initialEntries): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entries]}>
        <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
          {children}
        </Route>
      </MemoryRouter>
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

describe('useBundleChartData', () => {
  function setup() {
    const queryVarMock = vi.fn()

    server.use(
      graphql.query('GetBundleTrend', (info) => {
        queryVarMock(info.variables)
        return HttpResponse.json({ data: mockBundleTrendData })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )

    return { queryVarMock }
  }

  it('returns merged formatted data', async () => {
    setup()
    const { result } = renderHook(
      () =>
        useBundleChartData({
          provider: 'gh',
          owner: 'codecov',
          repo: 'test-repo',
          branch: 'main',
          bundle: 'test-bundle',
        }),
      { wrapper: wrapper() }
    )

    const expectedResult = {
      isLoading: false,
      maxY: 30,
      multiplier: 1_000,
      assetTypes: [
        'JAVASCRIPT_SIZE',
        'STYLESHEET_SIZE',
        'FONT_SIZE',
        'IMAGE_SIZE',
        'UNKNOWN_SIZE',
      ],
      data: [
        {
          date: new Date('2024-06-15T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 0,
          STYLESHEET_SIZE: 0,
          UNKNOWN_SIZE: 0,
        },
        {
          date: new Date('2024-06-16T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 0,
          STYLESHEET_SIZE: 0,
          UNKNOWN_SIZE: 0,
        },
        {
          date: new Date('2024-06-17T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 10000.8,
          STYLESHEET_SIZE: 1000,
          UNKNOWN_SIZE: 0,
        },
        {
          date: new Date('2024-06-18T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 10500,
          STYLESHEET_SIZE: 800,
          UNKNOWN_SIZE: 0,
        },
        {
          date: new Date('2024-06-19T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 20000,
          STYLESHEET_SIZE: 900,
          UNKNOWN_SIZE: 0,
        },
        {
          date: new Date('2024-06-20T00:00:00+00:00'),
          FONT_SIZE: 0,
          IMAGE_SIZE: 0,
          JAVASCRIPT_SIZE: 15000,
          STYLESHEET_SIZE: 950,
          UNKNOWN_SIZE: 0,
        },
      ],
    }
    await waitFor(() => expect(result.current).toStrictEqual(expectedResult))
  })

  describe('trend param is set', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2024-07-01'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should use the trend param to set the query args', async () => {
      const { queryVarMock } = setup()

      renderHook(
        () =>
          useBundleChartData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        {
          wrapper: wrapper(
            `${initialEntries}?${qs.stringify({ trend: '12 months' })}`
          ),
        }
      )

      await waitFor(() => expect(queryVarMock).toHaveBeenCalledTimes(1))
      expect(queryVarMock).toHaveBeenCalledWith({
        after: '2023-07-01T00:00:00.000Z',
        before: '2024-07-01T00:00:00.000Z',
        branch: 'main',
        bundle: 'test-bundle',
        filters: {
          assetTypes: [
            'JAVASCRIPT_SIZE',
            'STYLESHEET_SIZE',
            'FONT_SIZE',
            'IMAGE_SIZE',
            'UNKNOWN_SIZE',
          ],
          // temp removing while we don't have filtering by types implemented
          // loadTypes: [],
        },
        interval: 'INTERVAL_30_DAY',
        owner: 'codecov',
        repo: 'test-repo',
      })
    })
  })

  describe('types param', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2024-07-01'))
    })

    describe('no param set', () => {
      it('defaults to report size', async () => {
        const { queryVarMock } = setup()

        renderHook(
          () =>
            useBundleChartData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          {
            wrapper: wrapper(
              `${initialEntries}?${qs.stringify({ types: [] })}`
            ),
          }
        )

        await waitFor(() => expect(queryVarMock).toHaveBeenCalledTimes(1))
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              assetTypes: [
                'JAVASCRIPT_SIZE',
                'STYLESHEET_SIZE',
                'FONT_SIZE',
                'IMAGE_SIZE',
                'UNKNOWN_SIZE',
              ],
            }),
          })
        )
      })

      // this functionality is not implement yet - need to see if we are planning on implementing it*
      it.skip('defaults to empty load types array', async () => {
        const { queryVarMock } = setup()

        renderHook(
          () =>
            useBundleChartData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          {
            wrapper: wrapper(
              `${initialEntries}?${qs.stringify({ types: [] })}`
            ),
          }
        )

        await waitFor(() => expect(queryVarMock).toHaveBeenCalledTimes(1))
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              loadTypes: [],
            }),
          })
        )
      })
    })

    describe('param set', () => {
      it('should use the types param to set the query args', async () => {
        const { queryVarMock } = setup()

        renderHook(
          () =>
            useBundleChartData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          {
            wrapper: wrapper(
              `${initialEntries}?${qs.stringify({
                types: ['JAVASCRIPT'],
                // temp removing while we don't have filtering by types implemented
                // loading: ['INITIAL'],
              })}`
            ),
          }
        )

        await waitFor(() => expect(queryVarMock).toHaveBeenCalledTimes(1))
        expect(queryVarMock).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {
              assetTypes: ['JAVASCRIPT_SIZE'],
            },
          })
        )
      })
    })
  })
})
