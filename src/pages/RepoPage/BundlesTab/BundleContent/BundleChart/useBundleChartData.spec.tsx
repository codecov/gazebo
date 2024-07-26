import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBundleChartData } from './useBundleChartData'

const mockRepoOverview = {
  owner: {
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
}

const initialEntries = '/gh/codecov/test-repo/bundles/main/test-bundle'
const queryClient = new QueryClient()
const wrapper =
  (entries = initialEntries): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
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
    const queryVarMock = jest.fn()

    server.use(
      graphql.query('GetBundleTrend', (req, res, ctx) => {
        queryVarMock(req.variables)
        return res(ctx.status(200), ctx.data(mockBundleTrendData))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
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

    await waitFor(() => expect(result.current.isLoading).toBeTruthy())
    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    const expectedResult = {
      isLoading: false,
      maxY: 32,
      multiplier: 1_000,
      data: [
        {
          date: new Date('2024-06-15T00:00:00+00:00'),
          size: 0,
        },
        {
          date: new Date('2024-06-16T00:00:00+00:00'),
          size: 0,
        },
        {
          date: new Date('2024-06-17T00:00:00+00:00'),
          size: 11000.8,
        },
        {
          date: new Date('2024-06-18T00:00:00+00:00'),
          size: 11300,
        },
        {
          date: new Date('2024-06-19T00:00:00+00:00'),
          size: 20900,
        },
        {
          date: new Date('2024-06-20T00:00:00+00:00'),
          size: 15950,
        },
      ],
    }
    expect(result.current).toStrictEqual(expectedResult)
  })

  describe('trend param is set', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-07-01'))
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
          assetTypes: ['REPORT_SIZE'],
        },
        interval: 'INTERVAL_30_DAY',
        owner: 'codecov',
        repo: 'test-repo',
      })
    })
  })

  describe('types param', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-07-01'))
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
        expect(queryVarMock).toHaveBeenCalledWith({
          after: '2024-04-01T00:00:00.000Z',
          before: '2024-07-01T00:00:00.000Z',
          branch: 'main',
          bundle: 'test-bundle',
          filters: {
            assetTypes: ['REPORT_SIZE'],
          },
          interval: 'INTERVAL_7_DAY',
          owner: 'codecov',
          repo: 'test-repo',
        })
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
              `${initialEntries}?${qs.stringify({ types: ['JAVASCRIPT'] })}`
            ),
          }
        )

        await waitFor(() => expect(queryVarMock).toHaveBeenCalledTimes(1))
        expect(queryVarMock).toHaveBeenCalledWith({
          after: '2024-04-01T00:00:00.000Z',
          before: '2024-07-01T00:00:00.000Z',
          branch: 'main',
          bundle: 'test-bundle',
          filters: {
            assetTypes: ['JAVASCRIPT_SIZE'],
          },
          interval: 'INTERVAL_7_DAY',
          owner: 'codecov',
          repo: 'test-repo',
        })
      })
    })
  })
})
