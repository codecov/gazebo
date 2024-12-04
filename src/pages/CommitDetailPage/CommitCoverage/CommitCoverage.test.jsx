import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier/useTier'
import { UploadStateEnum } from 'shared/utils/commit'

import CommitCoverage from './CommitCoverage'

vi.mock('./BotErrorBanner', () => ({
  default: () => <div>BotErrorBanner</div>,
}))
vi.mock('./YamlErrorBanner', () => ({
  default: () => <div>YamlErrorBanner</div>,
}))
vi.mock('./routes/FilesChangedTab', () => ({
  default: () => <div>FilesChangedTab</div>,
}))
vi.mock('./UploadsCard', () => ({
  default: () => <div>UploadsCard</div>,
}))
vi.mock('./routes/IndirectChangesTab', () => ({
  default: () => <div>IndirectChangesTab</div>,
}))
vi.mock('./CommitCoverageSummary', () => ({
  default: () => <div>CommitCoverageSummary</div>,
}))
vi.mock('./routes/CommitDetailFileExplorer', () => ({
  default: () => <div>CommitDetailFileExplorer</div>,
}))
vi.mock('./routes/CommitDetailFileViewer', () => ({
  default: () => <div>CommitDetailFileViewer</div>,
}))

const mockCommitData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        coverageAnalytics: {
          totals: {
            coverage: 38.30846,
            diff: {
              coverage: null,
            },
          },
        },
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'complete',
        uploads: {
          edges: [
            {
              node: {
                id: 0,
                state: 'PROCESSED',
                provider: 'travis',
                createdAt: '2020-08-25T16:36:19.55947400:00',
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                uploadType: 'UPLOADED',
                errors: null,
                name: 'upload name',
                jobCode: null,
                buildCode: null,
              },
            },
          ],
        },
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: null,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
            },
          },
        },
      },
    },
  },
}

const mockErroredUploads = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        branchName: null,
        coverageAnalytics: {
          totals: {
            coverage: 38.30846,
            diff: {
              coverage: null,
            },
          },
        },
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        pullId: 10,
        createdAt: '2020-08-25T16:35:32',
        author: {
          username: 'febg',
        },
        state: 'complete',
        uploads: {
          edges: [
            {
              node: {
                id: 0,
                state: UploadStateEnum.error,
                provider: 'travis',
                createdAt: '2020-08-25T16:36:19.55947400:00',
                updatedAt: '2020-08-25T16:36:19.67986800:00',
                flags: [],
                downloadUrl:
                  '/api/gh/febg/repo-test/download/build?path=v4/raw/2020-08-25/F84D6D9A7F883055E40E3B380280BC44/f00162848a3cebc0728d915763c2fd9e92132408/30582d33-de37-4272-ad50-c4dc805802fb.txt',
                ciUrl: 'https://travis-ci.com/febg/repo-test/jobs/721065746',
                uploadType: 'UPLOADED',
                errors: null,
                name: 'upload name',
                jobCode: null,
                buildCode: null,
              },
            },
          ],
        },
        message: 'paths test',
        ciPassed: true,
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          patchTotals: null,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
        parent: {
          commitid: 'd773f5bc170caec7f6e64420b0967e7bac978a8f',
          coverageAnalytics: {
            totals: {
              coverage: 38.30846,
            },
          },
        },
      },
    },
  },
}

const mockRepoSettingsTeamData = (isPrivate = false) => ({
  owner: {
    isCurrentUserPartOfOrg: null,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
    },
  },
})

const mockOwnerTier = (tier = TierNames.PRO) => ({
  owner: {
    plan: {
      tierName: tier,
    },
  },
})

const mockRepoBackfilledData = {
  config: {
    isTimescaleEnabled: false,
  },
  owner: {
    repository: {
      coverageAnalytics: {
        flagsMeasurementsActive: false,
        flagsMeasurementsBackfilled: false,
        flagsCount: 0,
      },
    },
  },
}

const mockCommitErrors = (hasErrors = false) => {
  const yamlErrors = []
  const botErrors = []

  if (hasErrors) {
    yamlErrors.push({ node: { errorCode: 'invalid_yaml' } })
    botErrors.push({ node: { errorCode: 'repo_bot_invalid' } })
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        commit: {
          yamlErrors: {
            edges: yamlErrors,
          },
          botErrors: {
            edges: botErrors,
          },
        },
      },
    },
  }
}

const mockCompareTotals = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: null,
          indirectChangedFilesCount: 1,
          directChangedFilesCount: 1,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [],
          },
        },
      },
    },
  },
}

const mockOwnerData = {
  owner: {
    orgUploadToken: null,
    ownerid: 123,
    username: 'codecov',
    avatarUrl: 'http://127.0.0.1/avatar-url',
    isCurrentUserPartOfOrg: true,
    isAdmin: false,
  },
}

const mockCommitComponentData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        coverageAnalytics: {
          components: [],
        },
      },
    },
  },
}

const mockCommitPageData = (
  hasCommitPageMissingCommitDataError = false,
  hasCommitPageOtherDataError = false,
  hasFirstPR = false
) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: false,
      bundleAnalysisEnabled: true,
      coverageEnabled: true,
      commit: {
        commitid: 'id-1',
        compareWithParent: {
          __typename: hasCommitPageMissingCommitDataError
            ? 'MissingBaseCommit'
            : hasCommitPageOtherDataError
              ? 'MissingBaseReport'
              : hasFirstPR
                ? 'FirstPullRequest'
                : 'Comparison',
        },
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
          },
        },
      },
    },
  },
})

const mockRepoOverview = ({
  bundleAnalysisEnabled = false,
  coverageEnabled = false,
  isPrivate = false,
}) => ({
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: isPrivate,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled,
      bundleAnalysisEnabled,
      testAnalyticsEnabled: false,
      languages: ['javascript'],
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

const server = setupServer()

const wrapper =
  ({
    queryClient,
    queryClientV5,
    initialEntries = '/gh/test-org/test-repo/commit/1234567890abcdef',
    path = '/:provider/:owner/:repo/commit/:commit',
  }) =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path}>
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
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

describe('CommitCoverage', () => {
  function setup(
    {
      isPrivate = false,
      tierName = TierNames.PRO,
      hasCommitErrors = false,
      hasErroredUploads = false,
      hasCommitPageMissingCommitDataError = false,
      hasCommitPageOtherDataError = false,
      hasFirstPR = false,
      coverageEnabled = true,
      bundleAnalysisEnabled = true,
      isGithubRateLimited = false,
    } = {
      isPrivate: false,
      tierName: TierNames.PRO,
      hasCommitErrors: false,
      hasErroredUploads: false,
      hasCommitPageMissingCommitDataError: false,
      hasCommitPageOtherDataError: false,
      hasFirstPR: false,
      isGithubRateLimited: false,
    }
  ) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, suspense: true } },
    })
    const queryClientV5 = new QueryClientV5({
      defaultOptions: { queries: { retry: false } },
    })

    server.use(
      graphql.query('Commit', (info) => {
        if (hasErroredUploads) {
          return HttpResponse.json({ data: mockErroredUploads })
        }

        return HttpResponse.json({ data: mockCommitData })
      }),
      graphql.query('GetRepoSettingsTeam', (info) => {
        return HttpResponse.json({ data: mockRepoSettingsTeamData(isPrivate) })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: mockRepoOverview({
            coverageEnabled,
            bundleAnalysisEnabled,
            isPrivate,
          }),
        })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({ data: mockOwnerTier(tierName) })
      }),
      graphql.query('BackfillFlagMemberships', (info) => {
        return HttpResponse.json({ data: mockRepoBackfilledData })
      }),
      graphql.query('CommitErrors', (info) => {
        return HttpResponse.json({ data: mockCommitErrors(hasCommitErrors) })
      }),
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: mockOwnerData })
      }),
      graphql.query('CompareTotals', (info) => {
        return HttpResponse.json({ data: mockCompareTotals })
      }),
      graphql.query('CommitComponents', (info) => {
        return HttpResponse.json({ data: mockCommitComponentData })
      }),
      graphql.query('CommitPageData', (info) => {
        return HttpResponse.json({
          data: mockCommitPageData(
            hasCommitPageMissingCommitDataError,
            hasCommitPageOtherDataError,
            hasFirstPR
          ),
        })
      }),
      graphql.query('GetRepoRateLimitStatus', (info) => {
        return HttpResponse.json({
          data: mockRepoRateLimitStatus({ isGithubRateLimited }),
        })
      })
    )

    return { queryClient, queryClientV5 }
  }

  describe('testing different routes', () => {
    describe('/:provider/:owner/:repo/commit/:commit', () => {
      it('renders files changed tab', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({ queryClient, queryClientV5 }),
        })

        const filesChangedTab = await screen.findByText('FilesChangedTab')
        expect(filesChangedTab).toBeInTheDocument()
      })
    })

    describe('/:provider/:owner/:repo/commit/:commit/indirect-changes', () => {
      it('renders indirect changes tab', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({
            queryClient,
            queryClientV5,
            path: '/:provider/:owner/:repo/commit/:commit/indirect-changes',
            initialEntries:
              '/gh/test-org/test-repo/commit/1234567890abcdef/indirect-changes',
          }),
        })

        const indirectChangesTab = await screen.findByText('IndirectChangesTab')
        expect(indirectChangesTab).toBeInTheDocument()
      })
    })

    describe('/:provider/:owner/:repo/commit/:commit/tree/', () => {
      it('renders commit detail file explorer', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({
            queryClient,
            queryClientV5,
            path: '/:provider/:owner/:repo/commit/:commit/tree/',
            initialEntries:
              '/gh/test-org/test-repo/commit/1234567890abcdef/tree',
          }),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('/:provider/:owner/:repo/commit/:commit/tree/:path+', () => {
      it('renders commit detail file explorer', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({
            queryClient,
            queryClientV5,
            path: '/:provider/:owner/:repo/commit/:commit/tree/:path+',
            initialEntries:
              '/gh/test-org/test-repo/commit/1234567890abcdef/tree/src/',
          }),
        })

        const fileExplorer = await screen.findByText('CommitDetailFileExplorer')
        expect(fileExplorer).toBeInTheDocument()
      })
    })

    describe('/:provider/:owner/:repo/commit/:commit/blob/:path+', () => {
      it('renders commit detail file viewer', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({
            queryClient,
            queryClientV5,
            path: '/:provider/:owner/:repo/commit/:commit/blob/:path+',
            initialEntries:
              '/gh/test-org/test-repo/commit/1234567890abcdef/blob/src/index.js',
          }),
        })

        const fileViewer = await screen.findByText('CommitDetailFileViewer')
        expect(fileViewer).toBeInTheDocument()
      })
    })
  })

  describe('there are no errored uploads', () => {
    describe('rendering uploads card', () => {
      it('renders uploads card', async () => {
        const { queryClient, queryClientV5 } = setup()
        render(<CommitCoverage />, {
          wrapper: wrapper({ queryClient, queryClientV5 }),
        })

        const uploadsCard = await screen.findByText('UploadsCard')
        expect(uploadsCard).toBeInTheDocument()
      })
    })

    describe('user is on a team plan', () => {
      it('does not render commit coverage summary', async () => {
        const { queryClient, queryClientV5 } = setup({
          tierName: TierNames.TEAM,
          isPrivate: true,
        })
        render(<CommitCoverage />, {
          wrapper: wrapper({ queryClient, queryClientV5 }),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const coverageSummary = screen.queryByText('CommitCoverageSummary')
        expect(coverageSummary).not.toBeInTheDocument()
      })

      it('does not render indirect changes tab', async () => {
        const { queryClient, queryClientV5 } = setup({
          tierName: TierNames.TEAM,
          isPrivate: true,
        })
        render(<CommitCoverage />, {
          wrapper: wrapper({ queryClient, queryClientV5 }),
        })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const indirectChangesTab = screen.queryByText(/Indirect changes/)
        expect(indirectChangesTab).not.toBeInTheDocument()
      })
    })
  })

  describe('there are bot errors', () => {
    it('renders commit summary', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const commitCoverageSummary = await screen.findByText(
        'CommitCoverageSummary'
      )
      expect(commitCoverageSummary).toBeInTheDocument()
    })

    it('renders uploads card', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const uploadsCard = await screen.findByText('UploadsCard')
      expect(uploadsCard).toBeInTheDocument()
    })

    it('renders bot error banner', async () => {
      const { queryClient, queryClientV5 } = setup({ hasCommitErrors: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const botErrorBanner = await screen.findByText('BotErrorBanner')
      expect(botErrorBanner).toBeInTheDocument()
    })
  })

  describe('there are yaml errors', () => {
    it('renders commit summary', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const commitCoverageSummary = await screen.findByText(
        'CommitCoverageSummary'
      )
      expect(commitCoverageSummary).toBeInTheDocument()
    })

    it('renders uploads card', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const uploadsCard = await screen.findByText('UploadsCard')
      expect(uploadsCard).toBeInTheDocument()
    })

    it('renders yaml error banner', async () => {
      const { queryClient, queryClientV5 } = setup({ hasCommitErrors: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const yamlErrorBanner = await screen.findByText('YamlErrorBanner')
      expect(yamlErrorBanner).toBeInTheDocument()
    })
  })

  describe('there are errored uploads', () => {
    it('renders commit summary', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const commitCoverageSummary = await screen.findByText(
        'CommitCoverageSummary'
      )
      expect(commitCoverageSummary).toBeInTheDocument()
    })

    it('renders uploads card', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const uploadsCard = await screen.findByText('UploadsCard')
      expect(uploadsCard).toBeInTheDocument()
    })

    it('renders error uploads component', async () => {
      const { queryClient, queryClientV5 } = setup({ hasErroredUploads: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const erroredUploads = await screen.findByText(
        /No coverage data is available due to incomplete uploads on the first attempt./
      )
      expect(erroredUploads).toBeInTheDocument()
    })
  })

  describe('comparison returns first pull request', () => {
    it('renders first pull banner', async () => {
      const { queryClient, queryClientV5 } = setup({ hasFirstPR: true })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const firstPullRequest = await screen.findByText(/Welcome to Codecov/)
      expect(firstPullRequest).toBeInTheDocument()
    })
  })

  describe('commit has errors', () => {
    it('renders error banner for missing base commit', async () => {
      const { queryClient, queryClientV5 } = setup({
        hasCommitPageMissingCommitDataError: true,
      })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const missingBaseCommit = await screen.findByText(/Missing Base Commit/)
      expect(missingBaseCommit).toBeInTheDocument()
    })
    it('renders error banner', async () => {
      const { queryClient, queryClientV5 } = setup({
        hasCommitPageOtherDataError: true,
      })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const missingBaseCommit = await screen.findByText(/Missing Base Report/)
      expect(missingBaseCommit).toBeInTheDocument()
    })
  })

  describe('github rate limit messaging', () => {
    it('renders banner when github is rate limited', async () => {
      const { queryClient, queryClientV5 } = setup({
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
        isGithubRateLimited: true,
      })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const rateLimitText = await screen.findByText(
        /Unable to calculate coverage/
      )
      expect(rateLimitText).toBeInTheDocument()
    })

    it('does not render banner when github is not rate limited', async () => {
      const { queryClient, queryClientV5 } = setup({
        coverageEnabled: true,
        bundleAnalysisEnabled: true,
      })
      render(<CommitCoverage />, {
        wrapper: wrapper({ queryClient, queryClientV5 }),
      })

      const rateLimitText = screen.queryByText(/Unable to calculate coverage/)
      expect(rateLimitText).not.toBeInTheDocument()
    })
  })
})
