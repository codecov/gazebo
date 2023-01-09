import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullHeadData } from './usePullHeadData'

const mockPullData = {
  owner: {
    repository: {
      pull: {
        pullId: 1,
        title: 'Cool Pull Request',
        state: 'open',
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-branch',
          ciPassed: true,
        },
        updatestamp: '',
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

describe('usePullHeadData', () => {
  function setup() {
    server.use(
      graphql.query('PullHeadData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData))
      )
    )
  }

  describe('calling hook', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the correct data', async () => {
      const { result, waitFor } = renderHook(
        () =>
          usePullHeadData({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            pullId: '1',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(result.current.data).toStrictEqual({
        owner: {
          repository: {
            pull: {
              pullId: 1,
              title: 'Cool Pull Request',
              state: 'open',
              author: {
                username: 'cool-user',
              },
              head: {
                branchName: 'cool-branch',
                ciPassed: true,
              },
              updatestamp: '',
            },
          },
        },
      })
    })
  })
})
