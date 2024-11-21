import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSummary } from './useSummary'

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: true,
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
  __typename: 'Repository',
  branch: {
    name: 'main',
    head: {
      yamlState: 'DEFAULT',
      coverageAnalytics: {
        totals: {
          percentCovered: 95.0,
          lineCount: 100,
          hitsCount: 100,
        },
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
  function setup({ hasNoBranches } = { hasNoBranches: false }) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', (info) => {
        return HttpResponse.json({
          data: { owner: { repository: mockBranch(info.variables?.branch) } },
        })
      }),
      graphql.query('GetBranches', (info) => {
        if (hasNoBranches) {
          return HttpResponse.json({ data: { owner: null } })
        }

        if (info.variables?.filters?.searchValue === 'main') {
          return HttpResponse.json({
            data: { owner: { repository: mockMainBranchSearch } },
          })
        }

        return HttpResponse.json({
          data: { owner: { repository: mockBranches } },
        })
      }),
      graphql.query('GetRepoCoverage', () =>
        HttpResponse.json({
          data: { owner: { repository: mockRepoCoverage } },
        })
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
            yamlState: 'DEFAULT',
            coverageAnalytics: {
              totals: {
                percentCovered: 95.0,
                lineCount: 100,
                hitsCount: 100,
              },
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
