import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import PullRequestPageTabs from './PullRequestPageTabs'

jest.mock('shared/featureFlags')

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
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 1,
        head: {
          commitid: '123',
        },
        compareWithBase: {
          __typename: 'Comparison',
          directChangedFilesCount: 4,
          flagComparisonsCount: 3,
          indirectChangedFilesCount: 5,
          impactedFilesCount: 0,
          componentComparisonsCount: 0,
        },
      },
    },
  },
}

const mockFlagsResponse = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag-1',
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: '1-flag-1',
        },
      },
    },
  },
}

const mockBackfillResponse = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
      flagsCount: 4,
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/test-repo/pull/1') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/pull/:pullId',
              '/:provider/:owner/:repo/pull/:pullId/tree',
              '/:provider/:owner/:repo/pull/:pullId/tree/:path+',
              '/:provider/:owner/:repo/pull/:pullId/blob/:path+',
            ]}
          >
            {children}
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

describe('PullRequestPageTabs', () => {
  function setup(
    {
      multipleTiers = false,
      tierValue = TierNames.BASIC,
      privateRepo = false,
    } = {
      multipleTiers: false,
      tierValue: TierNames.BASIC,
      privateRepo: false,
    }
  ) {
    useFlags.mockReturnValue({
      multipleTiers,
    })
    server.use(
      graphql.query('PullPageData', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockPullData))
      }),
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockCommits))
      ),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: tierValue.toLowerCase() } },
          })
        )
      }),
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { private: privateRepo } },
          })
        )
      }),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagsResponse))
      }),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBackfillResponse))
      })
    )
  }

  describe('on base route', () => {
    describe('rendering files changed tab', () => {
      beforeEach(() => setup())

      it('renders link to root pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Files changed/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/gh/codecov/test-repo/pull/1')
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('4')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering indirect changes tab', () => {
      beforeEach(() => setup())

      it('renders link to indirect changes pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: /Indirect changes/,
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/indirect-changes'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('5')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering commits tab', () => {
      beforeEach(() => setup())

      it('renders link to commits pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Commits/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/commits'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('11')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering flags tab', () => {
      beforeEach(() => setup())

      it('renders link to flags pull route', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Flags/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/flags'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullRequestPageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('3')
        expect(tabCount).toBeInTheDocument()
      })
    })
  })

  describe('on file explorer route', () => {
    describe('on tree route', () => {
      beforeEach(() => setup())

      it('highlights file explorer tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')

        const indirectChanges = await screen.findByText('Indirect changes')
        expect(indirectChanges).toBeInTheDocument()
        expect(indirectChanges).not.toHaveAttribute('aria-current', 'page')

        const flags = await screen.findByText('Flags')
        expect(flags).toBeInTheDocument()
        expect(flags).not.toHaveAttribute('aria-current', 'page')

        const commits = await screen.findByText('Commits')
        expect(commits).toBeInTheDocument()
        expect(commits).not.toHaveAttribute('aria-current', 'page')
      })
    })

    describe('on a blob route', () => {
      beforeEach(() => setup())

      it('highlights files tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/index.js'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullRequestPageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/index.js'),
        })

        const filesChanged = await screen.findByText('Files changed')
        expect(filesChanged).toBeInTheDocument()
        expect(filesChanged).not.toHaveAttribute('aria-current', 'page')

        const indirectChanges = await screen.findByText('Indirect changes')
        expect(indirectChanges).toBeInTheDocument()
        expect(indirectChanges).not.toHaveAttribute('aria-current', 'page')

        const flags = await screen.findByText('Flags')
        expect(flags).toBeInTheDocument()
        expect(flags).not.toHaveAttribute('aria-current', 'page')

        const commits = await screen.findByText('Commits')
        expect(commits).toBeInTheDocument()
        expect(commits).not.toHaveAttribute('aria-current', 'page')
      })
    })
  })

  describe('rendering toggle header legend', () => {
    beforeEach(() => setup())

    it('renders uncovered legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('uncovered')
      expect(legend).toBeInTheDocument()
    })

    it('renders partial legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('partial')
      expect(legend).toBeInTheDocument()
    })

    it('renders covered legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const legend = await screen.findByText('covered')
      expect(legend).toBeInTheDocument()
    })

    it('renders hit count legend', async () => {
      render(<PullRequestPageTabs />, { wrapper: wrapper() })

      const hitIcon = await screen.findByText('n')
      expect(hitIcon).toBeInTheDocument()

      const legend = await screen.findByText('upload #')
      expect(legend).toBeInTheDocument()
    })
  })

  describe('Team plan', () => {
    describe('with multiple tiers flag', () => {
      describe('is a team plan on a public repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.TEAM,
            multipleTiers: true,
            privateRepo: false,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = await screen.findByText('Search for Flags')
          expect(flagSelect).toBeInTheDocument()
        })
      })

      describe('is a team plan on a private repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.TEAM,
            multipleTiers: true,
            privateRepo: true,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = screen.queryByText('Indirect changes')
          expect(indirect).not.toBeInTheDocument()

          const flags = screen.queryByText('Flags')
          expect(flags).not.toBeInTheDocument()

          const componentsTab = screen.queryByText('Components')
          expect(componentsTab).not.toBeInTheDocument()
        })

        it('does not render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = screen.queryByText('Search for Flags')
          expect(flagSelect).not.toBeInTheDocument()
        })
      })

      describe('is a pro plan on a public repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.PRO,
            multipleTiers: true,
            privateRepo: false,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = await screen.findByText('Search for Flags')
          expect(flagSelect).toBeInTheDocument()
        })
      })

      describe('is a pro plan on a private repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.PRO,
            multipleTiers: true,
            privateRepo: true,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does not render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = screen.queryByText('Search for Flags')
          expect(flagSelect).not.toBeInTheDocument()
        })
      })
    })
    describe('with out multiple tiers flag', () => {
      describe('is a team plan on a public repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.TEAM,
            multipleTiers: false,
            privateRepo: false,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = await screen.findByText('Search for Flags')
          expect(flagSelect).toBeInTheDocument()
        })
      })

      describe('is a team plan on a private repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.TEAM,
            multipleTiers: false,
            privateRepo: true,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does not render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = screen.queryByText('Search for Flags')
          expect(flagSelect).not.toBeInTheDocument()
        })
      })

      describe('is a pro plan on a public repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.PRO,
            multipleTiers: false,
            privateRepo: false,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = await screen.findByText('Search for Flags')
          expect(flagSelect).toBeInTheDocument()
        })
      })

      describe('is a pro plan on a private repo', () => {
        beforeEach(() =>
          setup({
            tierValue: TierNames.PRO,
            multipleTiers: false,
            privateRepo: true,
          })
        )

        it('renders correct tabs', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const components = await screen.findByText('Files changed')
          expect(components).toBeInTheDocument()

          const commits = await screen.findByText('Commits')
          expect(commits).toBeInTheDocument()

          const explorer = await screen.findByText('File explorer')
          expect(explorer).toBeInTheDocument()

          const indirect = await screen.findByText('Indirect changes')
          expect(indirect).toBeInTheDocument()

          const flags = await screen.findByText('Flags')
          expect(flags).toBeInTheDocument()

          const componentsTab = await screen.findByText('Components')
          expect(componentsTab).toBeInTheDocument()
        })

        it('does not render the flag select', async () => {
          render(<PullRequestPageTabs />, { wrapper: wrapper() })

          const flagSelect = screen.queryByText('Search for Flags')
          expect(flagSelect).not.toBeInTheDocument()
        })
      })
    })
  })
})
