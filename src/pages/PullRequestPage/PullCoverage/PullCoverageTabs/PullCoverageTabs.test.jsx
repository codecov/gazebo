import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import PullCoverageTabs from './PullCoverageTabs'

const mockOverview = (privateRepo = false) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: privateRepo,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: true,
      languages: ['typescript'],
    },
  },
})

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
              coverageAnalytics: {
                totals: {
                  coverage: 100,
                },
              },
              parent: {
                coverageAnalytics: {
                  totals: {
                    coverage: 100,
                  },
                },
              },
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 100,
                },
              },
              bundleAnalysis: {
                bundleAnalysisReport: {
                  __typename: 'BundleAnalysisReport',
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
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 11,
        },
        head: {
          commitid: '123',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
            },
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          directChangedFilesCount: 4,
          flagComparisonsCount: 3,
          indirectChangedFilesCount: 5,
          impactedFilesCount: 0,
          componentComparisonsCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
        },
      },
    },
  },
}

const mockFlagsResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
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
      coverageAnalytics: {
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        flagsCount: 4,
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test-repo/pull/1') =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
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
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('PullCoverageTabs', () => {
  function setup(
    { tierValue = TierNames.BASIC, privateRepo = false } = {
      tierValue: TierNames.BASIC,
      privateRepo: false,
    }
  ) {
    server.use(
      graphql.query('PullPageData', () => {
        return HttpResponse.json({ data: mockPullData })
      }),
      graphql.query('GetCommits', () => {
        return HttpResponse.json({ data: mockCommits })
      }),
      graphql.query('OwnerTier', () => {
        return HttpResponse.json({
          data: {
            owner: { plan: { tierName: tierValue.toLowerCase() } },
          },
        })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview(privateRepo) })
      }),
      graphql.query('FlagsSelect', () => {
        return HttpResponse.json({ data: mockFlagsResponse })
      }),
      graphql.query('BackfillFlagMemberships', () => {
        return HttpResponse.json({ data: mockBackfillResponse })
      }),
      graphql.query('PullFlagsSelect', () => {
        const dataReturned = {
          owner: {
            repository: {
              pull: {
                compareWithBase: {
                  flagComparisons: [
                    {
                      name: 'unit',
                    },
                    {
                      name: 'unit-latest-uploader',
                    },
                  ],
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('on base route', () => {
    describe('rendering files changed tab', () => {
      beforeEach(() => setup())

      it('renders link to root pull route', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Files changed/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/gh/codecov/test-repo/pull/1')
      })

      it('renders the correct tab count', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('4')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering indirect changes tab', () => {
      beforeEach(() => setup())

      it('renders link to indirect changes pull route', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

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
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('5')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering commits tab', () => {
      beforeEach(() => setup())

      it('renders link to commits pull route', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Commits/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/commits'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('11')
        expect(tabCount).toBeInTheDocument()
      })
    })

    describe('rendering flags tab', () => {
      beforeEach(() => setup())

      it('renders link to flags pull route', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const link = await screen.findByRole('link', { name: /Flags/ })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute(
          'href',
          '/gh/codecov/test-repo/pull/1/flags'
        )
      })

      it('renders the correct tab count', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const tabCount = await screen.findByText('3')
        expect(tabCount).toBeInTheDocument()
      })
    })
  })

  describe('on file explorer route', () => {
    describe('on tree route', () => {
      beforeEach(() => setup())

      it('highlights file explorer tab', async () => {
        render(<PullCoverageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullCoverageTabs />, {
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
        render(<PullCoverageTabs />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/index.js'),
        })

        const fileExplorer = await screen.findByText(/File explorer/)
        expect(fileExplorer).toBeInTheDocument()
        expect(fileExplorer).toHaveAttribute('aria-current', 'page')
      })

      it('does not highlight any other tab', async () => {
        render(<PullCoverageTabs />, {
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

  describe('Team plan', () => {
    describe('is a team plan on a public repo', () => {
      beforeEach(() =>
        setup({
          tierValue: TierNames.TEAM,
          privateRepo: false,
        })
      )

      it('renders correct tabs', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

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
    })

    describe('is a team plan on a private repo', () => {
      beforeEach(() =>
        setup({
          tierValue: TierNames.TEAM,
          privateRepo: true,
        })
      )

      it('renders correct tabs', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

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
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const flagSelect = screen.queryByText('Search for Flags')
        expect(flagSelect).not.toBeInTheDocument()
      })
    })

    describe('is a pro plan on a public repo', () => {
      beforeEach(() =>
        setup({
          tierValue: TierNames.PRO,
          privateRepo: false,
        })
      )

      it('renders correct tabs', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

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
    })

    describe('is a pro plan on a private repo', () => {
      beforeEach(() =>
        setup({
          tierValue: TierNames.PRO,
          privateRepo: true,
        })
      )

      it('renders correct tabs', async () => {
        render(<PullCoverageTabs />, { wrapper: wrapper() })

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
        render(<PullCoverageTabs />, { wrapper: wrapper() })

        const flagSelect = screen.queryByText('Search for Flags')
        expect(flagSelect).not.toBeInTheDocument()
      })
    })
  })
})
