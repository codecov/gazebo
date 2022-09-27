import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCompareTotals } from './useCompareTotals'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
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

const dataReturned = {
  owner: {
    repository: {
      commit: {
        compareWithParent: {
          state: 'processed',
        },
      },
    },
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('CompareTotals', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('CompareTotals', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(
      () =>
        useCompareTotals({
          provider,
          owner,
          repo,
        }),
      {
        wrapper,
      }
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data).toEqual({ state: 'processed' })
      })
    })
  })
})
