import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { ComparisonReturnType } from 'shared/utils/comparison'

import PullRequestPageContent from './PullCoverage'

vi.mock('./Summary', () => ({
  default: () => <div>CompareSummary</div>,
}))
vi.mock('./FirstPullBanner', () => ({
  default: () => <div>FirstPullBanner</div>,
}))
vi.mock('./PullCoverageTabs', () => ({
  default: () => 'PullCoverageTabs',
}))
vi.mock('./routes/FilesChangedTab', () => ({
  default: () => <div>FilesChangedTab</div>,
}))
vi.mock('./routes/IndirectChangesTab', () => ({
  default: () => <div>IndirectChangesTab</div>,
}))
vi.mock('./routes/CommitsTab', () => ({
  default: () => <div>CommitsTab</div>,
}))
vi.mock('./routes/FlagsTab', () => ({
  default: () => <div>FlagsTab</div>,
}))
vi.mock('./routes/FileExplorer', () => ({
  default: () => <div>FileExplorer</div>,
}))
vi.mock('./routes/FileViewer', () => ({
  default: () => <div>FileViewer</div>,
}))
vi.mock('./routes/ComponentsTab', () => ({
  default: () => <div>ComponentsTab</div>,
}))

const mockPullData = (resultType) => {
  if (resultType !== ComparisonReturnType.SUCCESSFUL_COMPARISON) {
    return {
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
                  __typename: 'MissingHeadReport',
                },
              },
            },
            compareWithBase: {
              __typename: resultType,
              message: resultType,
            },
            bundleAnalysisCompareWithBase: {
              __typename: 'BundleAnalysisComparison',
            },
          },
        },
      },
    }
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        pull: {
          pullId: 1,
          head: {
            commitid: '123',
            bundleAnalysis: {
              bundleAnalysisReport: {
                __typename: 'MissingHeadReport',
              },
            },
          },
          compareWithBase: {
            __typename: resultType,
            impactedFilesCount: 2,
            indirectChangedFilesCount: 3,
            directChangedFilesCount: 4,
            flagComparisonsCount: 5,
            componentComparisonsCount: 6,
          },
          bundleAnalysisCompareWithBase: {
            __typename: 'BundleAnalysisComparison',
          },
        },
      },
    },
  }
}

const mockPullDataTeam = {
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
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
            },
          },
        },
        compareWithBase: {
          __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
          impactedFilesCount: 2,
          directChangedFilesCount: 4,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
        },
      },
    },
  },
}

const mockRepoOverview = ({
  bundleAnalysisEnabled = false,
  coverageEnabled = false,
}) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled,
      bundleAnalysisEnabled,
      languages: ['typescript'],
      testAnalyticsEnabled: false,
    },
  },
})

const mockRepoRateLimitStatus = ({ isGithubRateLimited = false }) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      isGithubRateLimited,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/test-repo/pull/1') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/pull/:pullId/blob/:path+',
            '/:provider/:owner/:repo/pull/:pullId/tree/:path+',
            '/:provider/:owner/:repo/pull/:pullId/tree/',
            '/:provider/:owner/:repo/pull/:pullId',
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

describe('PullRequestPageContent', () => {
  function setup(
    {
      resultType = ComparisonReturnType.SUCCESSFUL_COMPARISON,
      tierValue = TierNames.BASIC,
      bundleAnalysisEnabled = false,
      coverageEnabled = false,
      isGithubRateLimited = false,
    } = {
      resultType: ComparisonReturnType.SUCCESSFUL_COMPARISON,
      tierValue: TierNames.BASIC,
      bundleAnalysisEnabled: false,
      coverageEnabled: false,
      isGithubRateLimited: false,
    }
  ) {
    server.use(
      graphql.query('PullPageData', (info) => {
        if (info.variables.isTeamPlan) {
          return HttpResponse.json({ data: mockPullDataTeam })
        }
        return HttpResponse.json({ data: mockPullData(resultType) })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: mockRepoOverview({
            bundleAnalysisEnabled,
            coverageEnabled,
          }),
        })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: {
            owner: { plan: { tierName: tierValue } },
          },
        })
      }),
      graphql.query('GetRepoRateLimitStatus', (info) => {
        return HttpResponse.json({
          data: mockRepoRateLimitStatus({ isGithubRateLimited }),
        })
      })
    )
  }

  it('renders the compare summary', async () => {
    setup({ resultType: ComparisonReturnType.SUCCESSFUL_COMPARISON })

    render(<PullRequestPageContent />, {
      wrapper: wrapper(),
    })

    const compareSummary = await screen.findByText('CompareSummary')
    expect(compareSummary).toBeInTheDocument()
  })

  describe('result type was not successful', () => {
    it('renders an error banner', async () => {
      setup({ resultType: ComparisonReturnType.MISSING_BASE_COMMIT })
      render(<PullRequestPageContent />, { wrapper: wrapper() })

      const errorBanner = await screen.findByRole('heading', {
        name: 'Missing Base Commit',
      })
      const filesChangedTab = await screen.findByText('FilesChangedTab')

      expect(errorBanner).toBeInTheDocument()
      expect(filesChangedTab).toBeInTheDocument() // first tab on page
    })
  })

  describe('result type is first pull request', () => {
    it('renders the first pull banner', async () => {
      setup({ resultType: ComparisonReturnType.FIRST_PULL_REQUEST })
      render(<PullRequestPageContent />, { wrapper: wrapper() })

      const firstPull = await screen.findByText('FirstPullBanner')
      expect(firstPull).toBeInTheDocument()
    })
  })

  describe('result type was successful', () => {
    describe('on the indirect changes path', () => {
      it('renders indirect changes tab', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/indirect-changes'),
        })

        const indirectChanges = await screen.findByText('IndirectChangesTab')
        expect(indirectChanges).toBeInTheDocument()
      })
    })

    describe('on the commits path', () => {
      it('renders the commits tab', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/commits'),
        })

        const commitsTab = await screen.findByText('CommitsTab')
        expect(commitsTab).toBeInTheDocument()
      })
    })

    describe('on the flags path', () => {
      it('renders the flags tab', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/flags'),
        })

        const flagsTab = await screen.findByText('FlagsTab')
        expect(flagsTab).toBeInTheDocument()
      })
    })

    describe('on the components path', () => {
      it('renders the components tab', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/components'),
        })

        const componentsTab = await screen.findByText('ComponentsTab')
        expect(componentsTab).toBeInTheDocument()
      })
    })

    describe('on the root path', () => {
      it('renders files changed tab', async () => {
        setup()
        render(<PullRequestPageContent />, { wrapper: wrapper() })

        const filesChangedTab = await screen.findByText('FilesChangedTab')
        expect(filesChangedTab).toBeInTheDocument()
      })
    })

    describe('on a random path', () => {
      it('redirects to the files changed tab', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/blah'),
        })

        const filesChangedTab = await screen.findByText('FilesChangedTab')
        expect(filesChangedTab).toBeInTheDocument()
      })
    })
  })

  describe('testing tree route', () => {
    describe('not path provided', () => {
      it('renders FileExplorer', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree'),
        })

        const fileExplorer = await screen.findByText('FileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('path provided', () => {
      it('renders FileExplorer', async () => {
        setup()
        render(<PullRequestPageContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/pull/1/tree/src/dir'),
        })

        const fileExplorer = await screen.findByText('FileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })
  })

  describe('testing blob path', () => {
    it('renders FileViewer', async () => {
      setup()
      render(<PullRequestPageContent />, {
        wrapper: wrapper('/gh/codecov/test-repo/pull/1/blob/src/file.js'),
      })

      const fileViewer = await screen.findByText('FileViewer')
      expect(fileViewer).toBeInTheDocument()
    })
  })

  describe('user is on team plan', () => {
    it('returns a valid response', async () => {
      setup({
        resultType: ComparisonReturnType.SUCCESSFUL_COMPARISON,
        tierValue: TierNames.TEAM,
      })
      render(<PullRequestPageContent />, {
        wrapper: wrapper(),
      })

      const filesChangedTab = await screen.findByText('FilesChangedTab')
      expect(filesChangedTab).toBeInTheDocument()
    })
  })

  describe('user lands on page', () => {
    describe('coverage and bundle analysis is enabled', () => {
      it('sends dropdown metric to sentry', async () => {
        setup({
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullRequestPageContent />, {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'pull_request_page.coverage_dropdown.opened',
            1,
            undefined
          )
        )
      })
    })

    describe('bundle analysis is disabled', () => {
      it('sends coverage page metric to sentry', async () => {
        setup({
          coverageEnabled: true,
          bundleAnalysisEnabled: false,
        })
        render(<PullRequestPageContent />, {
          wrapper: wrapper(),
        })

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'pull_request_page.coverage_page.visited_page',
            1,
            undefined
          )
        )
      })
    })
  })

  describe('github rate limit messaging', () => {
    it('renders banner when github is rate limited', async () => {
      setup({
        coverageEnabled: true,
        bundleAnalysisEnabled: false,
        isGithubRateLimited: true,
      })

      render(<PullRequestPageContent />, {
        wrapper: wrapper(),
      })

      const rateLimitText = await screen.findByText(
        /Unable to calculate coverage/
      )
      expect(rateLimitText).toBeInTheDocument()
    })

    it('does not render banner when github is not rate limited', async () => {
      setup({ isGithubRateLimited: false })

      render(<PullRequestPageContent />, {
        wrapper: wrapper(),
      })

      const filesChangedTab = await screen.findByText('FilesChangedTab')
      expect(filesChangedTab).toBeInTheDocument()

      const rateLimitText = screen.queryByText(/Unable to calculate coverage/)
      expect(rateLimitText).not.toBeInTheDocument()
    })
  })
})
