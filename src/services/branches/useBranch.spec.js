import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranch } from './useBranch'

const mockBranch = {
  owner: {
    repository: {
      branch: {
        name: 'main',
        head: {
          commitid: 'commit-123',
        },
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useBranch', () => {
  function setup() {
    server.use(
      graphql.query('GetBranch', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockBranch))
      )
    )
  }

  describe('calling hook', () => {
    beforeEach(() => setup())

    it('fetches the branch data', async () => {
      const { result, waitFor } = renderHook(
        () => useBranch({ provider: 'gh', owner: 'repo', branch: 'main' }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(result.current.data).toStrictEqual({
        branch: { name: 'main', head: { commitid: 'commit-123' } },
      })
    })
  })
})
