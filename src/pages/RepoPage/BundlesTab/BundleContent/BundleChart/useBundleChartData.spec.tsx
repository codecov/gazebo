import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import qs from 'querystring'

import { Trend } from 'shared/utils/timeseriesCharts'

import { createQueryVars, useBundleChartData } from './useBundleChartData'

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
            `${initialEntries}?${qs.encode({ trend: '12 months' })}`
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
})

describe('createQueryVars', () => {
  describe('trend is SEVEN_DAYS', () => {
    it('should return the correct interval and after date', () => {
      const today = new Date('2021-09-01')
      const oldestCommitAt = '2019-07-01'
      const trend = Trend.SEVEN_DAYS

      const queryVars = createQueryVars({ today, trend, oldestCommitAt })

      expect(queryVars).toEqual({
        interval: 'INTERVAL_1_DAY',
        after: new Date('2021-08-25'),
      })
    })
  })

  describe('trend is THIRTY_DAYS', () => {
    it('should return the correct interval and after date', () => {
      const today = new Date('2021-09-01')
      const oldestCommitAt = '2019-07-01'
      const trend = Trend.THIRTY_DAYS

      const queryVars = createQueryVars({ today, trend, oldestCommitAt })

      expect(queryVars).toEqual({
        interval: 'INTERVAL_1_DAY',
        after: new Date('2021-08-02'),
      })
    })
  })

  describe('trend is THREE_MONTHS', () => {
    it('should return the correct interval and after date', () => {
      const today = new Date('2021-09-01')
      const oldestCommitAt = '2019-07-01'
      const trend = Trend.THREE_MONTHS

      const queryVars = createQueryVars({ today, trend, oldestCommitAt })

      expect(queryVars).toEqual({
        interval: 'INTERVAL_7_DAY',
        after: new Date('2021-06-01'),
      })
    })
  })

  describe('trend is SIX_MONTHS', () => {
    it('should return the correct interval and after date', () => {
      const today = new Date('2021-09-01')
      const oldestCommitAt = '2019-07-01'
      const trend = Trend.SIX_MONTHS

      const queryVars = createQueryVars({ today, trend, oldestCommitAt })

      expect(queryVars).toEqual({
        interval: 'INTERVAL_30_DAY',
        after: new Date('2021-03-01'),
      })
    })
  })

  describe('trend is TWELVE_MONTHS', () => {
    it('should return the correct interval and after date', () => {
      const today = new Date('2021-09-01')
      const oldestCommitAt = '2019-07-01'
      const trend = Trend.TWELVE_MONTHS

      const queryVars = createQueryVars({ today, trend, oldestCommitAt })

      expect(queryVars).toEqual({
        interval: 'INTERVAL_30_DAY',
        after: new Date('2020-09-01'),
      })
    })
  })

  describe('trend is ALL_TIME', () => {
    describe('oldestCommitAt is provided', () => {
      it('should return the correct interval and after date', () => {
        const today = new Date('2021-09-01')
        const oldestCommitAt = '2019-07-01'
        const trend = Trend.ALL_TIME

        const queryVars = createQueryVars({ today, trend, oldestCommitAt })

        expect(queryVars).toEqual({
          interval: 'INTERVAL_30_DAY',
          after: new Date('2019-07-01'),
        })
      })
    })

    describe('oldestCommitAt is not provided', () => {
      it('should return the correct interval and after date', () => {
        const today = new Date('2021-09-01')
        const oldestCommitAt = null
        const trend = Trend.ALL_TIME

        const queryVars = createQueryVars({ today, trend, oldestCommitAt })

        expect(queryVars).toEqual({
          interval: 'INTERVAL_30_DAY',
          after: new Date('1970-01-01'),
        })
      })
    })
  })
})
