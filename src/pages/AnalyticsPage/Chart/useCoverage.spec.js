import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOrgCoverage } from 'services/charts'
import { useFlags } from 'shared/featureFlags'

import { useCoverage } from './useCoverage'

jest.mock('services/charts')
jest.mock('shared/featureFlags')

const mockRepoMeasurements = {
  owner: {
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
        timestamp: '2023-01-02T00:00:00+00:00',
        max: null,
      },
      {
        timestamp: '2023-01-03T00:00:00+00:00',
        max: 80,
      },
      {
        timestamp: '2023-01-04T00:00:00+00:00',
        max: 95,
      },
    ],
  },
}

const mockNullFirstValRepoMeasurements = {
  owner: {
    measurements: [
      {
        timestamp: '2023-01-01T00:00:00+00:00',
        max: null,
      },
      {
        timestamp: '2023-01-02T00:00:00+00:00',
        max: 80,
      },
    ],
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/cool-repo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  jest.resetAllMocks()
})
afterAll(() => server.close())

describe('useCoverage', () => {
  describe('flag is set to true', () => {
    function setup({ nullFirstVal = false } = { nullFirstVal: false }) {
      useFlags.mockReturnValue({
        analyticsPageTimeSeries: true,
      })

      server.use(
        graphql.query('GetReposCoverageMeasurements', (req, res, ctx) => {
          if (nullFirstVal) {
            return res(
              ctx.status(200),
              ctx.data(mockNullFirstValRepoMeasurements)
            )
          }

          return res(ctx.status(200), ctx.data(mockRepoMeasurements))
        })
      )
    }

    it('returns the data formatted correctly', async () => {
      setup()

      const { result, waitFor } = renderHook(
        () =>
          useCoverage({
            params: {
              startDate: new Date('2022/01/01'),
              endDate: new Date('2022/01/02'),
            },
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data?.coverage).toStrictEqual([
          { coverage: 85, date: new Date('2023-01-01T00:00:00.000Z') },
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
          { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
          { coverage: 80, date: new Date('2023-01-03T00:00:00.000Z') },
          { coverage: 95, date: new Date('2023-01-04T00:00:00.000Z') },
        ])
      )
    })

    describe('first value is null', () => {
      it('resets value to zero', async () => {
        setup({ nullFirstVal: true })

        const { result, waitFor } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/02'),
              },
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data?.coverage).toStrictEqual([
            { coverage: 0, date: new Date('2023-01-01T00:00:00.000Z') },
            { coverage: 80, date: new Date('2023-01-02T00:00:00.000Z') },
          ])
        )
      })
    })

    describe('coverage axis label', () => {
      it('returns the right format for days', async () => {
        setup()

        const { result, waitFor } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/10'),
              },
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const coverageAxisLabel = result.current.data.coverageAxisLabel

        const message = coverageAxisLabel(new Date('2022/01/01'))
        expect(message).toBe('Jan 1')
      })

      it('returns the right format for weeks', async () => {
        setup()

        const { result, waitFor } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/10/01'),
              },
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const coverageAxisLabel = result.current.data.coverageAxisLabel

        const message = coverageAxisLabel(new Date('2022/01/01'))
        expect(message).toBe('Jan')
      })

      it('returns the right format for default', async () => {
        setup()

        const { result, waitFor } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2023/10/01'),
              },
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const coverageAxisLabel = result.current.data.coverageAxisLabel

        const message = coverageAxisLabel(new Date('2022/01/01'))
        expect(message).toBe('Jan 2022')
      })
    })

    describe('select', () => {
      it('calls select', async () => {
        setup()

        let selectMock = jest.fn()

        const { waitFor } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/02'),
              },
              options: { select: selectMock },
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(selectMock).toBeCalled())
      })
    })
  })

  describe('flag is set to false', () => {
    beforeEach(() => {
      useFlags.mockReturnValue({
        analyticsPageTimeSeries: false,
      })
    })

    let config

    const mockCoverageData = {
      coverage: [{ coverage: 40.4 }, { coverage: 41 }, { coverage: 39.5 }],
    }

    const setupMockQuery = (mockData = mockCoverageData) => {
      useOrgCoverage.mockImplementation(({ query, opts }) => {
        config = query

        return opts.select(mockData)
      })
    }

    describe('Coverage Axis Label', () => {
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2022/01/01'))
        setupMockQuery()
      })
      afterEach(() => {
        queryClient.clear()
        jest.clearAllMocks()
      })

      it('returns the right format for days', () => {
        const { result } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/02'),
              },
            }),
          {
            wrapper,
          }
        )
        expect(config.groupingUnit).toEqual('day')
        expect(
          result.current.coverageAxisLabel(new Date('June 21, 2020'))
        ).toEqual('Jun 21')
      })

      it('returns the right format for weeks', () => {
        const { result } = renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2021/01/01'),
                endDate: new Date('2021/12/01'),
              },
            }),
          {
            wrapper,
          }
        )
        expect(config.groupingUnit).toEqual('week')
        expect(
          result.current.coverageAxisLabel(new Date('June 21, 2020'))
        ).toEqual('Jun 2020')
      })
    })

    describe('select', () => {
      beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2022/01/01'))
        setupMockQuery()
      })
      afterEach(() => {
        queryClient.clear()
        jest.clearAllMocks()
      })

      it('calls select', () => {
        let selectMock = jest.fn()

        renderHook(
          () =>
            useCoverage({
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/02'),
              },
              options: { select: selectMock },
            }),
          {
            wrapper,
          }
        )

        expect(selectMock).toBeCalled()
      })
    })
  })
})
