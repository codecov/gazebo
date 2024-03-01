import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitsTable from './CommitsTable'

const mockRepoOverview = (bundleAnalysisEnabled = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled,
      languages: ['javascript'],
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
  totals: {
    coverage: 89,
  },
  parent: {
    totals: {
      coverage: 77,
    },
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 80,
    },
  },
  bundleAnalysisReport: {
    __typename: 'MissingHeadReport',
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
  totals: {
    coverage: 98,
  },
  parent: {
    totals: {
      coverage: 0,
    },
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 90,
    },
  },
  bundleAnalysisReport: {
    __typename: 'BundleAnalysisReport',
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
  totals: {
    coverage: 100,
  },
  parent: {
    totals: {
      coverage: 0,
    },
  },
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
  bundleAnalysisReport: {
    __typename: 'BundleAnalysisReport',
  },
}

const server = setupServer()
const wrapper =
  (queryClient: QueryClient): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
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
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockRepoOverview(bundleAnalysisEnabled))
        )
      }),
      graphql.query('GetCommits', (req, res, ctx) => {
        if (noEntries) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'Repository',
                  commits: {
                    edges: [],
                    pageInfo: {
                      hasNextPage: false,
                      endCursor: null,
                    },
                  },
                },
              },
            })
          )
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              commits: {
                edges: req.variables.after
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
                  hasNextPage: req.variables.after ? false : true,
                  endCursor: req.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    return { queryClient }
  }

  describe('renders table headers', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const nameColumn = await screen.findByText('Name')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders ci status column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const ciStatusColumn = await screen.findByText('CI Status')
      expect(ciStatusColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const patchColumn = await screen.findByText('Patch')
      expect(patchColumn).toBeInTheDocument()
    })

    it('renders change column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const changeColumn = await screen.findByText('Change')
      expect(changeColumn).toBeInTheDocument()
    })

    it('renders coverage column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const coverageColumn = await screen.findByText('Coverage')
      expect(coverageColumn).toBeInTheDocument()
    })

    describe('bundle analysis is enabled', () => {
      it('renders bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: true })
        render(<CommitsTable branch="main" states={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = await screen.findByText('Bundle Analysis')
        expect(bundleAnalysis).toBeInTheDocument()
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not render bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: false })
        render(<CommitsTable branch="main" states={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = screen.queryByText('Bundle Analysis')
        expect(bundleAnalysis).not.toBeInTheDocument()
      })
    })
  })

  describe('renders table body', () => {
    it('renders name column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const nameColumn = await screen.findByText('commit message 1')
      expect(nameColumn).toBeInTheDocument()
    })

    it('renders ci status column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const ciStatusColumn = await screen.findByText('fdb5b182')
      expect(ciStatusColumn).toBeInTheDocument()
    })

    it('renders patch column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const patchColumn = await screen.findByText('80.00%')
      expect(patchColumn).toBeInTheDocument()
    })

    it('renders change column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const changeColumn = await screen.findByText('12.00%')
      expect(changeColumn).toBeInTheDocument()
    })

    it('renders coverage column', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })
      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const coverageColumn = await screen.findByText('89.00%')
      expect(coverageColumn).toBeInTheDocument()
    })

    describe('bundle analysis is enabled', () => {
      it('renders bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: true })
        render(<CommitsTable branch="main" states={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = await screen.findByText(/Upload: ✅/)
        expect(bundleAnalysis).toBeInTheDocument()
      })
    })

    describe('bundle analysis is disabled', () => {
      it('does not render bundle analysis column', async () => {
        const { queryClient } = setup({ bundleAnalysisEnabled: false })
        render(<CommitsTable branch="main" states={[]} search="" />, {
          wrapper: wrapper(queryClient),
        })

        const bundleAnalysis = screen.queryByText('Upload: &#x274B;')
        expect(bundleAnalysis).not.toBeInTheDocument()
      })
    })
  })

  describe('no data is returned', () => {
    it('renders error message', async () => {
      const { queryClient } = setup({ noEntries: true })
      render(<CommitsTable branch="main" states={[]} search="" />, {
        wrapper: wrapper(queryClient),
      })

      const errorMessage = await screen.findByText('No commits found')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('infinite scrolling', () => {
    it('loads next page', async () => {
      const { queryClient } = setup({})
      render(<CommitsTable branch="main" states={[]} search="" />, {
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
