import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLegacyRepoCoverage } from 'services/charts'
import { Trend } from 'shared/utils/legacyCharts'

import { useRepoCoverageTimeseries } from './useRepoCoverageTimeseries'

jest.mock('services/charts')

const queryClient = new QueryClient()
const wrapper =
  (searchParams = '') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein${searchParams}`]}>
        <Route path="/:provider/:owner/:repo">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )

describe('useRepoCoverageTimeseries', () => {
  let config

  const mockCoverageData = {
    coverage: [{ coverage: 40.4 }, { coverage: 41 }, { coverage: 39.5 }],
  }
  const setupMockQuery = (mockData = mockCoverageData) => {
    useLegacyRepoCoverage.mockImplementation(({ body, trend, opts }) => {
      config = body

      return opts.select(mockData)
    })
  }

  describe('with a trend in the url', () => {
    beforeEach(() => {
      queryClient.clear()
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setupMockQuery()
    })

    it('called the legacy repo coverage with the correct body', () => {
      renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(`?trend=${Trend.TWENTY_FOUR_HOURS}`),
        }
      )
      expect(config).toStrictEqual({
        aggFunction: 'min',
        aggValue: 'timestamp',
        branch: {
          name: 'c3',
          options: {},
        },
        coverageTimestampOrdering: 'increasing',
        groupingUnit: 'hour',
        repositories: ['mighty-nein'],
        startDate: new Date('2021-12-31T00:00:00.000Z'),
      })
    })
  })

  describe('with no trend in the url', () => {
    beforeEach(() => {
      queryClient.clear()
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setupMockQuery()
    })

    it('called the legacy repo coverage with the correct body when no trend is set', () => {
      renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(''),
        }
      )
      expect(config).toStrictEqual({
        aggFunction: 'min',
        aggValue: 'timestamp',
        branch: {
          name: 'c3',
          options: {},
        },
        coverageTimestampOrdering: 'increasing',
        groupingUnit: 'week',
        repositories: ['mighty-nein'],
        startDate: new Date('2021-10-01T00:00:00.000Z'),
      })
    })
  })

  describe('Coverage Axis Label', () => {
    beforeEach(() => {
      queryClient.clear()
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setupMockQuery()
    })

    it('returns the right format for hours', () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=24 hours'),
      })
      expect(config.groupingUnit).toEqual('hour')
      expect(
        result.current.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Sun, 12:00 am')
    })

    it('returns the right format for 30 days', () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=30 days'),
      })
      expect(config.groupingUnit).toEqual('day')
      expect(
        result.current.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun 21')
    })

    it('returns the right format for 6 months', () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=6 months'),
      })
      expect(config.groupingUnit).toEqual('week')
      expect(
        result.current.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun')
    })

    it('returns the right format for 12 months', () => {
      const { result } = renderHook(() => useRepoCoverageTimeseries({}), {
        wrapper: wrapper('?trend=12 months'),
      })
      expect(config.groupingUnit).toEqual('month')
      expect(
        result.current.coverageAxisLabel(new Date('June 21, 2020'))
      ).toEqual('Jun 2020')
    })
  })

  describe('coverage change', () => {
    beforeEach(() => {
      queryClient.clear()
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
    })

    it('returns the correct change', () => {
      setupMockQuery()
      const { result } = renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(''),
        }
      )

      expect(result.current.coverageChange).toBe(-0.8999999999999986)
    })

    it('returns 0 if not enough data', () => {
      setupMockQuery({
        coverage: [{ coverage: 40.4 }],
      })
      const { result } = renderHook(
        () =>
          useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
        {
          wrapper: wrapper(''),
        }
      )
      expect(result.current.coverageChange).toBe(0)
    })
  })

  describe('select', () => {
    beforeEach(() => {
      queryClient.clear()
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setupMockQuery()
    })

    it('calls select', () => {
      let selectMock = jest.fn()

      renderHook(() => useRepoCoverageTimeseries({}, { select: selectMock }), {
        wrapper: wrapper(''),
      })

      expect(selectMock).toBeCalled()
    })
  })
})
