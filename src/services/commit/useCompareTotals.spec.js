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

describe('useCompareTotals', () => {
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

    it('renders isLoading true', () => {
      const { result } = renderHook(
        () =>
          useCompareTotals({
            provider: 'gh',
            owner: 'codecov',
            repo: 'gazebo',
          }),
        {
          wrapper,
        }
      )
      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useCompareTotals({
              provider: 'gh',
              owner: 'codecov',
              repo: 'gazebo',
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
