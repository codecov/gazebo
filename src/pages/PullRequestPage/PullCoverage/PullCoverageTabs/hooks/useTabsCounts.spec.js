import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTabsCounts } from './useTabsCounts'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/bb/critical-role/bells-hells/pull/9') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const mockCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        totalCount: 11,
        edges: [
          {
            node: {
              ciPassed: true,
              message: 'commit message 1',
              commitid: 'id1',
              createdAt: '2021-08-30T19:33:49.819672',
              author: {
                username: 'user-1',
                avatarUrl: 'http://127.0.0.1/avatar-url',
              },
              totals: {
                coverage: 100,
              },
              parent: {
                totals: {
                  coverage: 100,
                },
              },
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 100,
                },
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      pull: {
        pullId: 1,
        head: {
          commitid: '123',
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          componentComparisonsCount: 6,
          directChangedFilesCount: 4,
          flagComparisonsCount: 1,
          indirectChangedFilesCount: 0,
          impactedFilesCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
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
      const { result } = renderHook(() => useTabsCounts(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current).toStrictEqual({
          flagsCount: 1,
          componentsCount: 6,
          directChangedFilesCount: 4,
          indirectChangesCount: 0,
          commitsCount: 11,
        })
      )
    })
  })
})
