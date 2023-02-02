import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useAllBranches } from './useAllBranches'

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
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useAllBranches', () => {
  function setup() {
    server.use(
      graphql.query('GetAllBranches', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                branches: {
                  edges: [{ node: { name: 'main', head: { commitid: 1 } } }],
                },
              },
            },
          })
        )
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => setup())

    it('loads the data', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useAllBranches({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isSuccess)

      const expectedResponse = {
        branches: [
          {
            name: 'main',
            head: {
              commitid: 1,
            },
          },
        ],
      }

      expect(result.current.data).toStrictEqual(expectedResponse)
    })
  })
})
