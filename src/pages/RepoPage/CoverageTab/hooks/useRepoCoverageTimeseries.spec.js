import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { Trend } from 'shared/utils/legacyCharts'

import { useRepoCoverageTimeseries } from './useRepoCoverageTimeseries'

const mockRepoOverview = {
  owner: {
    repository: {
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T12:00:00',
    },
  },
}

const mockBranchMeasurements = {
  owner: {
    repository: {
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
}

const mockNullBranchMeasurements = {
  owner: {
    repository: {
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
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (searchParams = '') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein${searchParams}`]}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useRepoCoverageTimeseries', () => {
  afterAll(() => jest.restoreAllMocks())

  function setup({ noCoverageData = false } = { noCoverageData: false }) {
    const configMock = jest.fn()
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      }),
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) => {
        configMock(req.variables)

        if (noCoverageData) {
          return res(ctx.status(200), ctx.data(mockNullBranchMeasurements))
        }

        return res(ctx.status(200), ctx.data(mockBranchMeasurements))
      })
    )

    return {
      config: configMock,
    }
  }

  describe('with a trend in the url', () => {
    it('called the legacy repo coverage with the correct body', async () => {
      const { config } = setup()
      const { waitFor, result } = renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(`?trend=${Trend.ALL_TIME}`),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(config).toHaveBeenLastCalledWith(
        expect.objectContaining({ interval: 'INTERVAL_30_DAY' })
      )
    })
  })

  describe('with no trend in the url', () => {
    it('called the legacy repo coverage with the correct body when no trend is set', async () => {
      const { config } = setup()
      const { result, waitFor } = renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(''),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(config).toHaveBeenLastCalledWith(
        expect.objectContaining({
          interval: 'INTERVAL_7_DAY',
        })
      )
    })
  })

  describe('Coverage Axis Label', () => {
    it('returns the right format for 30 days', async () => {
      const { config } = setup()
      const { result, waitFor } = renderHook(
        () => useRepoCoverageTimeseries({}),
        {
          wrapper: wrapper('?trend=30 days'),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(config).toHaveBeenLastCalledWith(
        expect.objectContaining({ interval: 'INTERVAL_1_DAY' })
      )
      expect(
        result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun 21')
    })

    it('returns the right format for 6 months', async () => {
      const { config } = setup()
      const { result, waitFor } = renderHook(
        () => useRepoCoverageTimeseries({}),
        {
          wrapper: wrapper('?trend=6 months'),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(config).toHaveBeenLastCalledWith(
        expect.objectContaining({ interval: 'INTERVAL_7_DAY' })
      )

      expect(
        result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun')
    })

    it('returns the right format for 12 months', async () => {
      const { config } = setup()
      const { result, waitFor } = renderHook(
        () => useRepoCoverageTimeseries({}),
        {
          wrapper: wrapper('?trend=12 months'),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(config).toHaveBeenLastCalledWith(
        expect.objectContaining({ interval: 'INTERVAL_30_DAY' })
      )

      expect(
        result.current.data.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun 2020')
    })
  })

  describe('coverage change', () => {
    describe('there is coverage data', () => {
      beforeEach(() => {
        setup()
      })

      it('returns the correct change', async () => {
        setup()
        const { result, waitFor } = renderHook(
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
      it('returns zero', async () => {
        setup({ noCoverageData: true })
        const { result, waitFor } = renderHook(
          () =>
            useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
          {
            wrapper: wrapper(''),
          }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data.coverageChange).toBe(0)
      })
    })
  })

  describe('select', () => {
    it('calls select', async () => {
      setup()
      const selectMock = jest.fn()

      const { waitFor } = renderHook(
        () => useRepoCoverageTimeseries({}, { select: selectMock }),
        {
          wrapper: wrapper(''),
        }
      )

      await waitFor(() => expect(selectMock).toBeCalled())
    })
  })
})
