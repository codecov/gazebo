import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
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
  function setup({ noPullData } = { noPullData: false }) {
    server.use(
      graphql.query('PullHeadData', (req, res, ctx) => {
        if (noPullData) {
          return res(ctx.status(200), ctx.data({ owner: { repository: {} } }))
        }

        return res(ctx.status(200), ctx.data(mockPullData))
      })
    )
  }

  describe('calling hook', () => {
    describe('when there is pull data', () => {
      beforeEach(() => {
        setup()
      })

      it('returns the correct data', async () => {
        const { result } = renderHook(
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

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
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
          })
        )
      })
    })

    describe('when there is no pull data', () => {
      beforeEach(() => {
        setup({ noPullData: true })
      })

      it('returns an empty object', async () => {
        const { result } = renderHook(
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

        await waitFor(() => expect(result.current.data).toStrictEqual({}))
      })
    })
  })
})
