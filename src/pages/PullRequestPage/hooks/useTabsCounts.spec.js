import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTabsCounts } from './useTabsCounts'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/bb/critical-role/bells-hells/pull/9']}>
    <Route path="/:provider/:owner/:repo/pull/:pullId">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const mockCommits = {
  owner: {
    repository: {
      commits: {
        totalCount: 11,
      },
    },
  },
}

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: true,
      pull: {
        pullId: 1,
        compareWithBase: {
          directChangedFilesCount: 4,
          indirectChangedFilesCount: 0,
          flagComparisonsCount: 1,
          __typename: 'Comparison',
        },
      },
    },
  },
}

const server = setupServer()

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

describe('useTabsCount', () => {
  function setup() {
    server.use(
      graphql.query('PullPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullData))
      ),
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCommits))
      )
    )
  }

  describe('calling hook', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the correct data', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useTabsCounts(), {
        wrapper,
      })

      await waitForNextUpdate()

      expect(result.current).toStrictEqual({
        flagsCount: 1,
        directChangedFilesCount: 4,
        indirectChangesCount: 0,
        commitsCount: 11,
      })
    })
  })
})
