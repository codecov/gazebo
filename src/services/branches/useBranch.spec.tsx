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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
        () =>
          useBranch({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            branch: 'main',
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          branch: { name: 'main', head: { commitid: 'commit-123' } },
        })
      )
    })
  })
})
