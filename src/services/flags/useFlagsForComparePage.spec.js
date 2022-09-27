import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useFlagsForComparePage } from './useFlagsForComparePage'

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
const pullId = 3

const mockResponseData = [
  {
    name: 'testOne',
    headTotals: {
      percentCovered: 82.71,
    },
    baseTotals: {
      percentCovered: 80.0,
    },
    patchTotals: {
      percentCovered: 59.0,
    },
  },
  {
    name: 'testTwo',
    headTotals: {
      percentCovered: 58.84,
    },
    baseTotals: {
      percentCovered: 13.28,
    },
    patchTotals: {
      percentCovered: 72.38,
    },
  },
]

const dataReturned = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          flagComparisons: mockResponseData,
        },
      },
    },
  },
}

describe('useFlagsForComparePage', () => {
  let hookData

  function setup(data = dataReturned) {
    server.use(
      graphql.query('FlagComparisons', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(
      () => useFlagsForComparePage({ provider, owner, repo, pullId }),
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

  describe('when there is no compareWithBase', () => {
    beforeEach(() => {
      const dataReturned = {
        owner: {
          repository: {
            pull: {
              compareWithBase: null,
            },
          },
        },
      }
      return setup(dataReturned)
    })

    it('returns chart data', () => {
      expect(hookData.result.current.data).toStrictEqual([])
    })
  })
})
