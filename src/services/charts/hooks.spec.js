import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useOrgCoverage } from './hooks'

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

const exampleQuarterRes = {
  coverage: [
    {
      date: '2020-04-01T00:00:00Z',
      total_hits: 4.0,
      total_misses: 0.0,
      total_partials: 0.0,
      total_lines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-07-01T00:00:00Z',
      total_hits: 4.0,
      total_misses: 0.0,
      total_partials: 0.0,
      total_lines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-10-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-04-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-07-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
  ],
}

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

const exampleYearlyRes = {
  coverage: [
    {
      date: '2020-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      total_hits: 41.0,
      total_misses: 4.0,
      total_partials: 0.0,
      total_lines: 45.0,
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
  const provider = 'woofhub'
  const owner = 'doggo'

  let hookData

  beforeEach(() => {
    server.use(
      rest.get(
        `/internal/charts/${provider}/${owner}/coverage/organization`,
        (req, res, ctx) => {
          // This is maybe a bit redundent atm but I would like to test some data mutation utils later
          const query = req.url.searchParams
          if (query.get('grouping_unit') === 'yearly') {
            return res(ctx.status(200), ctx.json(exampleYearlyRes))
          } else if (query.get('grouping_unit') === 'quarterly') {
            return res(ctx.status(200), ctx.json(exampleQuarterRes))
          }
          // Not testing for errors.. yet.
          return res(ctx.status(500), ctx.json({ error: 'noop' }))
        }
      )
    )
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
