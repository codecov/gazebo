import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOrgCoverage } from 'services/charts'

import { useCoverage } from './useCoverage'

jest.mock('services/charts')

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/caleb/mighty-nein`]}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useCoverage', () => {
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
          useCoverage(
            {
              params: {
                startDate: new Date('2022/01/01'),
                endDate: new Date('2022/01/02'),
              },
            },
            { select: selectMock }
          ),
        {
          wrapper,
        }
      )

      expect(selectMock).toBeCalled()
    })
  })
})
