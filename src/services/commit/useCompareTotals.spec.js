import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
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
  function setup() {
    server.use(
      graphql.query('CompareTotals', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
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

        await waitFor(() =>
          expect(result.current.data).toEqual({ state: 'processed' })
        )
      })
    })
  })
})
