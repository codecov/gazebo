import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBundleSummary } from './useBundleSummary'

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
}

const mockMainBranchSearch = {
  branches: {
    edges: [
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranches = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranch = (branchName: string) => ({
  __typename: 'Repository',
  branch: {
    name: branchName,
    head: {
      commitid: branchName === 'branch-1' ? 'asdf123' : '321fdsa',
    },
  },
})

const mockRepoCoverage = {
  branch: {
    name: 'main',
    head: {
      totals: {
        percentCovered: 95.0,
        lineCount: 100,
        hitsCount: 100,
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo']}>
      <Route path="/:provider/:owner/:repo">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
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

interface SetupArgs {
  hasNoBranches?: boolean
  nullOverview?: boolean
}

describe('useBundleSummary', () => {
  function setup(
    { hasNoBranches = false, nullOverview = false }: SetupArgs = {
      hasNoBranches: false,
      nullOverview: false,
    }
  ) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        if (nullOverview) {
          return res(ctx.status(200), ctx.data({ owner: null }))
        }

        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      }),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockBranch(req.variables?.branch) } })
        )
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        if (hasNoBranches) {
          return res(ctx.status(200), ctx.data({ owner: null }))
        }

        if (req.variables?.filters?.searchValue === 'main') {
          return res(
            ctx.status(200),
            ctx.data({ owner: { repository: mockMainBranchSearch } })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockBranches } })
        )
      }),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoCoverage } })
        )
      )
    )
  }

  describe('useBranches returns list of branches', () => {
    it('passed down branch selector props', async () => {
      setup()
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() =>
        expect(result.current.branchSelectorProps).toStrictEqual({
          items: [
            {
              name: 'branch-1',
              head: {
                commitid: 'asdf123',
              },
            },
            {
              name: 'main',
              head: {
                commitid: '321fdsa',
              },
            },
          ],
          value: {
            name: 'main',
            head: {
              commitid: '321fdsa',
            },
          },
        })
      )
    })

    it('passed down the currentBranchSelected', async () => {
      setup()
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() =>
        expect(result.current.currentBranchSelected).toEqual({
          name: 'main',
          head: { commitid: '321fdsa' },
        })
      )
    })

    it('passed down the defaultBranch', async () => {
      setup()
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() => expect(result.current.defaultBranch).toEqual('main'))
    })

    it('passed down the privateRepo', async () => {
      setup()
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() => expect(result.current.privateRepo).toEqual(false))
    })

    it('sets branchList to list of branches', async () => {
      setup()
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() =>
        expect(result.current.branchList).toStrictEqual([
          {
            name: 'branch-1',
            head: {
              commitid: 'asdf123',
            },
          },
          {
            name: 'main',
            head: {
              commitid: '321fdsa',
            },
          },
        ])
      )
    })
  })

  describe('useBranches returns empty list of branches', () => {
    it('sets branchList to empty list', async () => {
      setup({ hasNoBranches: true })
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() => expect(result.current.branchList).toStrictEqual([]))
    })
  })

  describe('useRepoOverview returns null', () => {
    it('returns undefined default branch', async () => {
      setup({ nullOverview: true })
      const { result } = renderHook(() => useBundleSummary(), { wrapper })

      await waitFor(() => expect(result.current.defaultBranch).toBeUndefined())
    })
  })
})
