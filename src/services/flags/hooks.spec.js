import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useFlagsForComparePage } from './hooks'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const provider = 'github'
const owner = 'ashton'
const repo = 'temporal-morass'
const query = { pullid: 3 }

const mockResponseData = [
  {
    name: 'secondTest',
    baseReportTotals: {
      files: 1,
      lines: 12,
      hits: 12,
      misses: 0,
      partials: 0,
      coverage: 80,
      branches: 2,
      methods: 4,
      messages: 0,
      sessions: 1,
      complexity: 0,
      complexityTotal: 0,
      complexityRatio: 0,
      diff: 0,
    },
    headReportTotals: {
      files: 1,
      lines: 14,
      hits: 12,
      misses: 1,
      partials: 1,
      coverage: 82.71,
      branches: 3,
      methods: 5,
      messages: 0,
      sessions: 1,
      complexity: 0,
      complexityTotal: 0,
      complexityRatio: 0,
      diff: 0,
    },
    diffTotals: {
      files: 2,
      lines: 0,
      hits: 0,
      misses: 0,
      partials: 0,
      coverage: 59,
      branches: 0,
      methods: 0,
      messages: 0,
      sessions: 0,
      complexity: null,
      complexityTotal: null,
      complexityRatio: 0,
      diff: 0,
    },
  },
  {
    name: 'testOne',
    baseReportTotals: {
      files: 1,
      lines: 12,
      hits: 12,
      misses: 0,
      partials: 0,
      coverage: 90,
      branches: 2,
      methods: 4,
      messages: 0,
      sessions: 1,
      complexity: 0,
      complexityTotal: 0,
      complexityRatio: 0,
      diff: 0,
    },
    headReportTotals: {
      files: 1,
      lines: 12,
      hits: 12,
      misses: 0,
      partials: 0,
      coverage: 100,
      branches: 2,
      methods: 4,
      messages: 0,
      sessions: 1,
      complexity: 0,
      complexityTotal: 0,
      complexityRatio: 0,
      diff: 0,
    },
    diffTotals: {
      files: 2,
      lines: 7,
      hits: 7,
      misses: 0,
      partials: 0,
      coverage: 100,
      branches: 2,
      methods: 2,
      messages: 0,
      sessions: 0,
      complexity: 0,
      complexityTotal: 0,
      complexityRatio: 0,
      diff: 0,
    },
  },
]

describe('useFlagsForComparePage', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/repos/${repo}/compare/flags`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockResponseData))
        }
      )
    )

    hookData = renderHook(
      () => useFlagsForComparePage({ provider, owner, repo, query }),
      {
        wrapper,
      }
    )
    return hookData.waitFor(() => {
      return !hookData.result.current.isFetching
    })
  }

  describe('returns quaterly coverage data', () => {
    beforeEach(() => {
      return setup()
    })

    it('returns chart data', () => {
      expect(hookData.result.current.data).toStrictEqual(mockResponseData)
    })
  })
})
