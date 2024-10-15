import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitsTable from './CommitsTable'

const mockRepoOverview = (bundleAnalysisEnabled = false) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
})

const node1 = {
  ciPassed: true,
  message: 'commit message 1',
  commitid: 'fdb5b182241cfdc8d8a8dd1c6f98d1259f522b9c',
  createdAt: '2023-10-11T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/cool-user-avatar',
  },
  bundleStatus: 'COMPLETED',
  coverageStatus: 'COMPLETED',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: { percentCovered: 80 },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'MissingHeadReport',
      message: 'Missing head report',
    },
  },
}

const node2 = {
  ciPassed: false,
  message: 'commit message 2 ',
  commitid: 'c8e17f4e29983bdb5027de77d6ef150cd911f2b9',
  createdAt: '2023-10-12T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/cool-user-avatar',
  },
  bundleStatus: 'COMPLETED',
  coverageStatus: 'COMPLETED',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: { percentCovered: 90 },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'BundleAnalysisComparison',
      bundleChange: { size: { uncompress: 1000 } },
    },
  },
}

const node3 = {
  ciPassed: false,
  message: 'commit message 3',
  commitid: '7822fd88f36efcd9af276792813a83da17bd3c67',
  createdAt: '2023-10-13T00:00.000000',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/cool-user-avatar',
  },
  bundleStatus: 'COMPLETED',
  coverageStatus: 'COMPLETED',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'BundleAnalysisComparison',
      bundleChange: {
        size: {
          uncompress: 1001,
        },
      },
    },
  },
}

const server = setupServer()
const wrapper =
  (queryClient: QueryClient): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov/cool-repo/commits']}>
        <Route path="/:provider/:owner/:repo/commits">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  noEntries?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('CommitsTable', () => {
  function setup({
    noEntries = false,
    bundleAnalysisEnabled = false,
  }: SetupArgs) {
    const queryClient = new QueryClient()

    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: mockRepoOverview(bundleAnalysisEnabled),
        })
      }),
      graphql.query('GetCommits', (info) => {
        if (noEntries) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'Repository',
                  commits: {
                    edges: [],
                    pageInfo: { hasNextPage: false, endCursor: null },
                  },
                },
              },
            },
          })
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              commits: {
                edges: info.variables.after
                  ? [
                      {
                        node: node3,
                      },
                    ]
                  : [
                      {
                        node: node1,
                      },
                      {
                        node: node2,
                      },
                    ],
                pageInfo: {
                  hasNextPage: info.variables.after ? false : true,
                  endCursor: info.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )

    return { queryClient }
  }

  describe('renders table headers', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const nameColumn = await screen.findByText('Name')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const patchColumn = await screen.findByText('Patch Coverage')
      expect(patchColumn).toBeInTheDocument()
    })

    describe('bundle analysis is enabled', () => {
      it('renders bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: true })
        render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = await screen.findByText('Bundle')
        expect(bundleAnalysis).toBeInTheDocument()
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not render bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: false })
        render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = screen.queryByText('Bundle')
        expect(bundleAnalysis).not.toBeInTheDocument()
      })
    })
  })

  describe('renders table body', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const nameColumn = await screen.findByText('commit message 1')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const patchColumn = await screen.findByText('80.00%')
      expect(patchColumn).toBeInTheDocument()
    })

    describe('bundle analysis is enabled', () => {
      it('renders bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: true })
        render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = await screen.findByText('+1kB')
        expect(bundleAnalysis).toBeInTheDocument()
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not render bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: false })
        render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = screen.queryByText('Upload: ❌')
        expect(bundleAnalysis).not.toBeInTheDocument()
      })
    })
  })

  describe('no data is returned', () => {
    it('renders error message', async () => {
      const { queryClient } = setup({ noEntries: true })
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const errorMessage = await screen.findByText('No commits found')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('infinite scrolling', () => {
    it('loads next page', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" coverageStatus={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const thirdCommit = await screen.findByText('commit message 3')
      expect(thirdCommit).toBeInTheDocument()
    })
  })
})
