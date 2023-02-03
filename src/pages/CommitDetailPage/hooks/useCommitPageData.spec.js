import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommitPageData } from './useCommitPageData'

const mockData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      commit: {
        commitid: 'id-1',
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useCommitPageData', () => {
  function setup() {
    server.use(
      graphql.query('CommitPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  describe('when executed', () => {
    beforeEach(() => {
      setup()
    })

    it('fetches the correct data', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useCommitPageData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            commitId: 'id-1',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedResult = {
        isCurrentUserPartOfOrg: true,
        commit: {
          commitid: 'id-1',
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })
})
