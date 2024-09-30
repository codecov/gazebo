import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider } from 'pages/RepoPage/context'
import { TierNames, TTierNames } from 'services/tier'

import PullRequestPage from './PullRequestPage'

vi.mock('./Header', () => ({ default: () => 'Header' }))
vi.mock('./PullCoverage', () => ({ default: () => 'PullCoverage' }))
vi.mock('./PullBundleAnalysis', () => ({ default: () => 'PullBundleAnalysis' }))

const mockPullHeadData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 12,
        title: 'Cool New Pull Request',
        state: 'OPEN',
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-new-branch',
          ciPassed: true,
        },
        updatestamp: '2023-01-01T12:00:00.000000',
      },
    },
  },
}

const mockPullPageData = {
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
    impactedFilesCount: 4,
    indirectChangedFilesCount: 0,
    flagComparisonsCount: 1,
    componentComparisonsCount: 6,
    directChangedFilesCount: 0,
  },
  bundleAnalysisCompareWithBase: {
    __typename: 'BundleAnalysisComparison',
  },
}

const mockPullPageDataTeam = {
  pullId: 877,
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
    impactedFilesCount: 4,
    directChangedFilesCount: 0,
  },
  bundleAnalysisCompareWithBase: {
    __typename: 'BundleAnalysisComparison',
  },
}

const mockPullCoverageDropdownSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          patchTotals: {
            missesCount: 1,
            partialsCount: 2,
          },
        },
      },
    },
  },
}

const mockPullBADropdownSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: {
          commitid: '2788fb9824b079807f7992f04482450c09774ec7',
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          bundleChange: {
            loadTime: {
              threeG: 2,
            },
            size: {
              uncompress: 1,
            },
          },
        },
      },
    },
  },
}

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
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo/pull/12'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">
          <RepoBreadcrumbProvider>{children}</RepoBreadcrumbProvider>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => {
  server.close()
})

interface SetupArgs {
  pullData?: typeof mockPullPageData | null
  tierValue?: TTierNames
  privateRepo?: boolean
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('PullRequestPage', () => {
  function setup({
    pullData = mockPullPageData,
    tierValue = TierNames.BASIC,
    privateRepo = false,
    coverageEnabled = true,
    bundleAnalysisEnabled = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullHeadData', (info) => {
        return HttpResponse.json({ data: mockPullHeadData })
      }),
      graphql.query('PullPageData', (info) => {
        if (info.variables.isTeamPlan) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'Repository',
                  coverageEnabled,
                  bundleAnalysisEnabled,
                  pull: mockPullPageDataTeam,
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                coverageEnabled,
                bundleAnalysisEnabled,
                pull: pullData,
              },
            },
          },
        })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview(privateRepo) })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: {
            owner: { plan: { tierName: tierValue } },
          },
        })
      }),
      graphql.query('PullCoverageDropdownSummary', (info) => {
        return HttpResponse.json({ data: mockPullCoverageDropdownSummary })
      }),
      graphql.query('PullBADropdownSummary', (info) => {
        return HttpResponse.json({ data: mockPullBADropdownSummary })
      })
    )
  }

  describe('when pull data is available', () => {
    describe('repo has coverage enabled', () => {
      it('renders pull coverage', async () => {
        setup({ coverageEnabled: false })
        render(<PullRequestPage />, { wrapper: wrapper() })

        const pullCoverage = await screen.findByText(/PullCoverage/)
        expect(pullCoverage).toBeInTheDocument()
      })
    })

    describe('repo has bundle analysis enabled', () => {
      it('renders pull bundle analysis', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: false })
        render(<PullRequestPage />, { wrapper: wrapper() })

        const pullBundleAnalysis = await screen.findByText(/PullBundleAnalysis/)
        expect(pullBundleAnalysis).toBeInTheDocument()
      })
    })

    describe('repo has coverage and bundle analysis enabled', () => {
      it('renders pull coverage dropdown', async () => {
        setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
        render(<PullRequestPage />, { wrapper: wrapper() })

        const pullCoverage = await screen.findByText(/Coverage report/)
        expect(pullCoverage).toBeInTheDocument()
      })

      it('renders pull bundle analysis', async () => {
        setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
        render(<PullRequestPage />, { wrapper: wrapper() })

        const pullBundleAnalysis = await screen.findByText(/Bundle report/)
        expect(pullBundleAnalysis).toBeInTheDocument()
      })
    })
  })

  describe('when there is no pull data', () => {
    it('renders not found', async () => {
      setup({ pullData: null })
      render(<PullRequestPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText(/Not found/)
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('dropdown query param is present in the url', () => {
    describe('query param is coverage', () => {
      it('renders the PullCoverage component', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: true })
        render(<PullRequestPage />, {
          wrapper: wrapper('/gh/test-org/test-repo/pull/12?dropdown=coverage'),
        })

        const PullCoverage = await screen.findByText(/PullCoverage/)
        expect(PullCoverage).toBeInTheDocument()
      })
    })

    describe('query param is bundle', () => {
      it('renders the PullBundleAnalysis component', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: true })
        render(<PullRequestPage />, {
          wrapper: wrapper('/gh/test-org/test-repo/pull/12?dropdown=bundle'),
        })

        const PullBundleAnalysis = await screen.findByText(/PullBundleAnalysis/)
        expect(PullBundleAnalysis).toBeInTheDocument()
      })
    })
  })
})
