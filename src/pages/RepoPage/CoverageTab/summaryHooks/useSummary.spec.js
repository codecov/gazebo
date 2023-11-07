import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSummary } from './useSummary'

const mockRepoOverview = {
  private: false,
  defaultBranch: 'main',
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

const mockBranch = (branchName) => ({
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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/caleb/mighty-nein']}>
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

describe('useSummary', () => {
  function setup({ hasNoBranches } = { hasBranches: false }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
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
    beforeEach(() => {
      setup()
    })

    it('passes down useRepoCoverage', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

      await waitFor(() =>
        expect(result.current.data).toEqual({
          name: 'main',
          head: {
            totals: {
              percentCovered: 95.0,
              lineCount: 100,
              hitsCount: 100,
            },
          },
        })
      )
    })

    it('passed down branch selector props', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

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
      const { result } = renderHook(() => useSummary(), { wrapper })

      await waitFor(() =>
        expect(result.current.currentBranchSelected).toEqual({
          name: 'main',
          head: { commitid: '321fdsa' },
        })
      )
    })

    it('passed down the defaultBranch', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

      await waitFor(() => expect(result.current.defaultBranch).toEqual('main'))
    })

    it('passed down the privateRepo', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

      await waitFor(() => expect(result.current.privateRepo).toEqual(false))
    })

    it('sets branchList to list of branches', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

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
    beforeEach(() => {
      setup({ hasNoBranches: true })
    })

    it('sets branchList to empty list', async () => {
      const { result } = renderHook(() => useSummary(), { wrapper })

      await waitFor(() => expect(result.current.branchList).toStrictEqual([]))
    })
  })
})
