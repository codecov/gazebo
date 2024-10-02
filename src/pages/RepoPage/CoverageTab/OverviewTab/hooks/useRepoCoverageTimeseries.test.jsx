import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { Trend } from 'shared/utils/legacyCharts'

import { useRepoCoverageTimeseries } from './useRepoCoverageTimeseries'

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
      languages: [],
      testAnalyticsEnabled: false,
    },
  },
}

const mockBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        measurements: [
          {
            timestamp: '2023-01-01T00:00:00+00:00',
            max: 85,
          },
          {
            timestamp: '2023-01-02T00:00:00+00:00',
            max: 80,
          },
          {
            timestamp: '2023-01-03T00:00:00+00:00',
            max: 90,
          },
          {
            timestamp: '2023-01-04T00:00:00+00:00',
            max: 100,
          },
        ],
      },
    },
  },
}

const mockNullBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        measurements: [
          {
            timestamp: '2023-01-01T00:00:00+00:00',
            max: null,
          },
          {
            timestamp: '2023-01-02T00:00:00+00:00',
            max: null,
          },
        ],
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (searchParams = '') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein${searchParams}`]}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useRepoCoverageTimeseries', () => {
  let config = vi.fn()

  function setup({ noCoverageData = false } = { noCoverageData: false }) {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      }),
      graphql.query('GetBranchCoverageMeasurements', (info) => {
        config(info.variables)

        if (noCoverageData) {
          return HttpResponse.json({ data: mockNullBranchMeasurements })
        }

        return HttpResponse.json({ data: mockBranchMeasurements })
      })
    )
  }

  describe('with a trend in the url', () => {
    beforeEach(() => {
      setup()
    })

    it('called the legacy repo coverage with the correct body', async () => {
      renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(`?trend=${Trend.ALL_TIME}`),
        }
      )

      await waitFor(() => expect(config).toHaveBeenCalled())
      await waitFor(() =>
        expect(config).toHaveBeenCalledWith(
          expect.objectContaining({ interval: 'INTERVAL_30_DAY' })
        )
      )
    })
  })

  describe('with no trend in the url', () => {
    beforeEach(() => {
      setup()
    })

    it('called the legacy repo coverage with the correct body when no trend is set', async () => {
      renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(''),
        }
      )

      await waitFor(() => expect(config).toHaveBeenCalled())
      await waitFor(() =>
        expect(config).toHaveBeenCalledWith(
          expect.objectContaining({
            interval: 'INTERVAL_7_DAY',
          })
        )
      )
    })
  })

  describe('Coverage Axis Label', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the right format for 30 days', async () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=30 days'),
      })

      await waitFor(() => expect(config).toHaveBeenCalled())
      await waitFor(() =>
        expect(config).toHaveBeenCalledWith(
          expect.objectContaining({ interval: 'INTERVAL_1_DAY' })
        )
      )

      await waitFor(() =>
        expect(
          result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
        ).toEqual('Jun 21')
      )
    })

    it('returns the right format for 6 months', async () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=6 months'),
      })

      await waitFor(() => expect(config).toHaveBeenCalled())
      await waitFor(() =>
        expect(config).toHaveBeenCalledWith(
          expect.objectContaining({ interval: 'INTERVAL_7_DAY' })
        )
      )

      await waitFor(() =>
        expect(
          result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
        ).toEqual('Jun')
      )
    })

    it('returns the right format for 12 months', async () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=12 months'),
      })

      await waitFor(() => expect(config).toHaveBeenCalled())
      await waitFor(() =>
        expect(config).toHaveBeenCalledWith(
          expect.objectContaining({ interval: 'INTERVAL_30_DAY' })
        )
      )

      await waitFor(() =>
        expect(
          result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
        ).toEqual('Jun 2020')
      )
    })
  })

  describe('coverage change', () => {
    describe('there is coverage data', () => {
      beforeEach(() => {
        setup()
      })

      it('returns the correct change', async () => {
        const { result } = renderHook(
          () =>
            useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
          {
            wrapper: wrapper(''),
          }
        )

        await waitFor(() => expect(result.current.data.coverageChange).toBe(15))
      })
    })

    describe('there is no coverage data', () => {
      beforeEach(() => {
        setup({ noCoverageData: true })
      })

      it('returns zero', async () => {
        const { result } = renderHook(
          () =>
            useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
          {
            wrapper: wrapper(''),
          }
        )

        await waitFor(() => expect(result.current.data.coverageChange).toBe(0))
      })
    })
  })

  describe('select', () => {
    beforeEach(() => {
      setup()
    })

    it('calls select', async () => {
      let selectMock = vi.fn()

      renderHook(() => useRepoCoverageTimeseries({}, { select: selectMock }), {
        wrapper: wrapper(''),
      })

      await waitFor(() => expect(selectMock).toHaveBeenCalled())
    })
  })
})
