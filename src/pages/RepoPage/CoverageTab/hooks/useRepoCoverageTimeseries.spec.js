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
  let hookData
  function setup({ searchParams } = { searchParams: '' }) {
    useLegacyRepoCoverage.mockReturnValue({
      data: { coverage: [{ coverage: 30 }, { coverage: 40 }] },
      isSuccess: true,
    })

    hookData = renderHook(
      () => useRepoCoverageTimeseries({ branch: { name: 'c3', options: {} } }),
      {
        wrapper: wrapper(searchParams),
      }
    )
  }

  describe('with a trend in the url', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setup({ searchParams: `?trend=${Trend.TWENTY_FOUR_HOURS}` })
    })

    it('called the legacy repo coverage with the correct body', () => {
      expect(useLegacyRepoCoverage).toBeCalledWith({
        body: {
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
        },
        branch: {
          name: 'c3',
          options: {},
        },
        opts: undefined,
        owner: 'caleb',
        provider: 'gh',
        trend: '24 hours',
      })
    })
  })

  describe('with no trend in the url', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2022/01/01'))
      setup()
    })

    it('called the legacy repo coverage with the correct body when no trend is set', () => {
      expect(useLegacyRepoCoverage).toBeCalledWith({
        body: {
          aggFunction: 'min',
          aggValue: 'timestamp',
          branch: {
            name: 'c3',
            options: {},
          },
          coverageTimestampOrdering: 'increasing',
          groupingUnit: 'month',
          repositories: ['mighty-nein'],
          startDate: new Date('2021-01-01T00:00:00.000Z'),
        },
        branch: {
          name: 'c3',
          options: {},
        },
        opts: undefined,
        owner: 'caleb',
        provider: 'gh',
        trend: undefined,
      })
    })

    it('calculates the correct change', () => {
      expect(hookData.result.current.coverageChange).toBe(10)
    })
  })
})
