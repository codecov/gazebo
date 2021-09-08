import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useOrgCoverage } from './hooks'

import { orgCoverageHandler } from './mocks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const exampleQuarterHookData = {
  coverage: [
    {
      date: '2020-04-01T00:00:00Z',
      totalHits: 4.0,
      totalMisses: 0.0,
      totalPartials: 0.0,
      totalLines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-07-01T00:00:00Z',
      totalHits: 4.0,
      totalMisses: 0.0,
      totalPartials: 0.0,
      totalLines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-10-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-04-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-07-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
  ],
}

const exampleYearlyHookData = {
  coverage: [
    {
      date: '2020-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
  ],
}

describe('useOrgCoverage', () => {
  const provider = 'gl'
  const owner = 'doggo'

  let hookData

  beforeEach(() => {
    server.use(orgCoverageHandler)
  })

  function setup({
    provider = 'github',
    owner = 'Doggo',
    query = { groupingUnit: 'quarterly' },
  }) {
    hookData = renderHook(() => useOrgCoverage({ provider, owner, query }), {
      wrapper,
    })
    return hookData.waitFor(() => {
      return !hookData.result.current.isFetching
    })
  }

  describe('returns quaterly coverage data', () => {
    beforeEach(() => {
      return setup({ provider, owner, query: { groupingUnit: 'quarterly' } })
    })

    it('returns chart data', () => {
      expect(hookData.result.current.data).toStrictEqual(exampleQuarterHookData)
    })
  })

  describe('returns year coverage data', () => {
    beforeEach(() => {
      return setup({ provider, owner, query: { groupingUnit: 'yearly' } })
    })

    it('returns chart data', () => {
      expect(hookData.result.current.data).toStrictEqual(exampleYearlyHookData)
    })
  })
})
