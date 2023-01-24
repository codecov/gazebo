import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullPageData } from './usePullPageData'

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: true,
      pull: {
        commits: {
          totalCount: 1,
        },
        pullId: 1,
        compareWithBase: {
          impactedFilesCount: 4,
          indirectChangedFilesCount: 0,
          flagComparisonsCount: 1,
          __typename: 'Comparison',
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

describe('usePullPageData', () => {
  function setup() {
    server.use(
      graphql.query('PullPageData', (req, res, ctx) =>
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
          usePullPageData({
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
        hasAccess: true,
        pull: {
          commits: {
            totalCount: 1,
          },
          pullId: 1,
          compareWithBase: {
            impactedFilesCount: 4,
            indirectChangedFilesCount: 0,
            flagComparisonsCount: 1,
            __typename: 'Comparison',
          },
        },
      })
    })
  })
})
