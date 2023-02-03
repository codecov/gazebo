import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommitHeaderData } from './useCommitHeaderData'

const mockData = {
  owner: {
    repository: {
      commit: {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: 'id-1',
        createdAt: '2022-01-01T12:59:59',
        message: 'cool commit message',
        pullId: '1234',
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

describe('useCommitHeaderData', () => {
  function setup() {
    server.use(
      graphql.query('CommitPageHeaderData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  describe('fetching data', () => {
    beforeEach(() => {
      setup()
    })

    it('sets the correct data', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useCommitHeaderData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            commitId: 'id-1',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedResult = {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: 'id-1',
        createdAt: '2022-01-01T12:59:59',
        message: 'cool commit message',
        pullId: '1234',
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })
})
