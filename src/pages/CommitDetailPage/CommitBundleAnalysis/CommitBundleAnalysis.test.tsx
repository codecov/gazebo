import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitBundleAnalysis from './CommitBundleAnalysis'

vi.mock('./CommitBundleAnalysisTable', () => ({
  default: () => <div>CommitBundleAnalysisTable</div>,
}))

vi.mock('./EmptyTable', () => ({ default: () => <div>EmptyTable</div> }))

const mockCommitPageData = ({
  bundleAnalysisEnabled = true,
  coverageEnabled = true,
  firstPullRequest = false,
  comparisonError = false,
  hasCachedBundle = false,
}: {
  bundleAnalysisEnabled?: boolean
  coverageEnabled?: boolean
  firstPullRequest?: boolean
  comparisonError?: boolean
  hasCachedBundle?: boolean
}) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: false,
      bundleAnalysisEnabled,
      coverageEnabled,
      commit: {
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
        compareWithParent: {
          __typename: 'Comparison',
        },
        bundleAnalysis: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            isCached: hasCachedBundle,
          },
          bundleAnalysisCompareWithParent: {
            __typename: firstPullRequest
              ? 'FirstPullRequest'
              : comparisonError
                ? 'MissingHeadCommit'
                : 'BundleAnalysisComparison',
          },
        },
      },
    },
  },
})

const mockSummaryData = (uncompress: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
            bundleChange: {
              loadTime: {
                threeG: 2,
              },
              size: {
                uncompress,
              },
            },
          },
        },
      },
    },
  },
})

const mockNoData = { owner: null }

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'FirstPullRequest',
            message: 'First pull request',
          },
        },
      },
    },
  },
}

const mockComparisonError = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'MissingHeadCommit',
            message: 'Missing head commit',
          },
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
      testAnalyticsEnabled: false,
      languages: ['javascript'],
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[
          '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
        ]}
      >
        <Route path="/:provider/:owner/:repo/commit/:commit">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
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

interface SetupArgs {
  bundleAnalysisEnabled?: boolean
  coverageEnabled?: boolean
  uncompress?: number
  noData?: boolean
  firstPullRequest?: boolean
  comparisonError?: boolean
  hasCachedBundle?: boolean
}

describe('CommitBundleAnalysis', () => {
  function setup(
    {
      coverageEnabled = true,
      bundleAnalysisEnabled = true,
      uncompress = 0,
      noData = false,
      firstPullRequest = false,
      comparisonError = false,
      hasCachedBundle = false,
    }: SetupArgs = {
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      uncompress: 0,
      noData: false,
      firstPullRequest: false,
      comparisonError: false,
      hasCachedBundle: false,
    }
  ) {
    server.use(
      graphql.query('CommitPageData', () => {
        return HttpResponse.json({
          data: mockCommitPageData({
            coverageEnabled,
            bundleAnalysisEnabled,
            firstPullRequest,
            comparisonError,
            hasCachedBundle,
          }),
        })
      }),
      graphql.query('CommitBADropdownSummary', () => {
        if (noData) {
          return HttpResponse.json({ data: mockNoData })
        } else if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullRequest })
        } else if (comparisonError) {
          return HttpResponse.json({ data: mockComparisonError })
        }

        return HttpResponse.json({ data: mockSummaryData(uncompress) })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: mockRepoOverview({ coverageEnabled, bundleAnalysisEnabled }),
        })
      })
    )
  }

  describe('both coverage and bundle analysis is enabled', () => {
    it('renders CommitBundleAnalysisTable', async () => {
      setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
      render(<CommitBundleAnalysis />, { wrapper })

      const commitBundleAnalysisTable = await screen.findByText(
        'CommitBundleAnalysisTable'
      )
      expect(commitBundleAnalysisTable).toBeInTheDocument()
    })

    describe('there are cached bundles', () => {
      it('renders CachedBundleContentBanner', async () => {
        setup({ hasCachedBundle: true })
        render(<CommitBundleAnalysis />, { wrapper })

        const cachedBundleContentBanner = await screen.findByText(
          'The reported bundle size includes cached data from previous commits'
        )
        expect(cachedBundleContentBanner).toBeInTheDocument()
      })
    })

    describe('there are no cached bundles', () => {
      it('does not render CachedBundleContentBanner', async () => {
        setup({ hasCachedBundle: false })
        render(<CommitBundleAnalysis />, { wrapper })

        await waitFor(() => queryClientV5.isFetching())
        await waitFor(() => !queryClientV5.isFetching())

        const cachedBundleContentBanner = screen.queryByText(
          'The reported bundle size includes cached data from previous commits'
        )
        expect(cachedBundleContentBanner).not.toBeInTheDocument()
      })
    })

    describe('there is no data', () => {
      it('renders unknown error message', async () => {
        setup({
          noData: true,
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const message = await screen.findByText(/an unknown error occurred/)
        expect(message).toBeInTheDocument()
      })
    })

    describe('first pull request __typename', () => {
      it('renders first PR summary message', async () => {
        setup({
          firstPullRequest: true,
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const message = await screen.findByText(
          /once merged to default, your following pull request and commits will include report details/
        )
        expect(message).toBeInTheDocument()
      })

      it('renders welcome banner', async () => {
        setup({
          firstPullRequest: true,
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const header = await screen.findByText(/Welcome to bundle analysis/)
        expect(header).toBeInTheDocument()
      })

      it('renders welcome message', async () => {
        setup({
          firstPullRequest: true,
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const header = await screen.findByText(
          'Once merged to your default branch, Codecov will compare your bundle reports and display the results on pull requests and commits.'
        )
        expect(header).toBeInTheDocument()
      })
    })

    describe('error __typename', () => {
      it('renders error banner header', async () => {
        setup({
          comparisonError: true,
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const header = await screen.findByText(/Missing Head Commit/)
        expect(header).toBeInTheDocument()
      })

      it('renders error banner message', async () => {
        setup({
          comparisonError: true,
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const message = await screen.findByText(
          'Unable to compare commits because the head commit was not found.'
        )
        expect(message).toBeInTheDocument()
      })

      it('renders empty table', async () => {
        setup({
          comparisonError: true,
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<CommitBundleAnalysis />, { wrapper })

        const emptyTable = await screen.findByText(/EmptyTable/)
        expect(emptyTable).toBeInTheDocument()
      })
    })
  })

  describe('bundle analysis is only enabled', () => {
    describe('renders summary message', () => {
      describe('there is a positive size delta', () => {
        it('renders increase summary message', async () => {
          setup({
            uncompress: 10000,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const increaseMessage = await screen.findByText(
            /changes will increase total bundle size by 10kB/
          )
          expect(increaseMessage).toBeInTheDocument()
        })
      })

      describe('there is a negative size delta', () => {
        it('renders decrease summary message', async () => {
          setup({
            uncompress: -10000,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const decreaseMessage = await screen.findByText(
            /changes will decrease total bundle size by 10kB/
          )
          expect(decreaseMessage).toBeInTheDocument()
        })
      })

      describe('there is no size delta', () => {
        it('renders no change summary message', async () => {
          setup({
            uncompress: 0,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const noChangeMessage = await screen.findByText(
            /bundle size has no change/
          )
          expect(noChangeMessage).toBeInTheDocument()
        })
      })

      describe('there is no data', () => {
        it('renders unknown error message', async () => {
          setup({
            noData: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const message = await screen.findByText(/an unknown error occurred/)
          expect(message).toBeInTheDocument()
        })
      })

      describe('first pull request __typename', () => {
        it('renders first PR summary message', async () => {
          setup({
            firstPullRequest: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const message = await screen.findByText(
            /once merged to default, your following pull request and commits will include report details/
          )
          expect(message).toBeInTheDocument()
        })

        it('renders welcome banner', async () => {
          setup({
            firstPullRequest: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const header = await screen.findByText(/Welcome to bundle analysis/)
          expect(header).toBeInTheDocument()
        })

        it('renders welcome message', async () => {
          setup({
            firstPullRequest: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const header = await screen.findByText(
            'Once merged to your default branch, Codecov will compare your bundle reports and display the results on pull requests and commits.'
          )
          expect(header).toBeInTheDocument()
        })
      })

      describe('error __typename', () => {
        it('renders error summary message', async () => {
          setup({
            comparisonError: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const bundleReport = await screen.findByText(/Bundle report:/)
          expect(bundleReport).toBeInTheDocument()

          const message = await screen.findByText(/missing head commit/)
          expect(message).toBeInTheDocument()
        })

        it('renders error banner header', async () => {
          setup({
            comparisonError: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const header = await screen.findByText(/Missing Head Commit/)
          expect(header).toBeInTheDocument()
        })

        it('renders error banner message', async () => {
          setup({
            comparisonError: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const message = await screen.findByText(
            'Unable to compare commits because the head commit was not found.'
          )
          expect(message).toBeInTheDocument()
        })

        it('renders empty table', async () => {
          setup({
            comparisonError: true,
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<CommitBundleAnalysis />, { wrapper })

          const emptyTable = await screen.findByText(/EmptyTable/)
          expect(emptyTable).toBeInTheDocument()
        })
      })
    })

    describe('there are cached bundles', () => {
      it('renders CachedBundleContentBanner', async () => {
        setup({ hasCachedBundle: true })
        render(<CommitBundleAnalysis />, { wrapper })

        const cachedBundleContentBanner = await screen.findByText(
          'The reported bundle size includes cached data from previous commits'
        )
        expect(cachedBundleContentBanner).toBeInTheDocument()
      })
    })

    describe('there are no cached bundles', () => {
      it('does not render CachedBundleContentBanner', async () => {
        setup({ hasCachedBundle: false })
        render(<CommitBundleAnalysis />, { wrapper })

        await waitFor(() => queryClientV5.isFetching())
        await waitFor(() => !queryClientV5.isFetching())

        const cachedBundleContentBanner = screen.queryByText(
          'The reported bundle size includes cached data from previous commits'
        )
        expect(cachedBundleContentBanner).not.toBeInTheDocument()
      })
    })

    it('renders CommitBundleAnalysisTable', async () => {
      setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
      render(<CommitBundleAnalysis />, { wrapper })

      const commitBundleAnalysisTable = await screen.findByText(
        'CommitBundleAnalysisTable'
      )
      expect(commitBundleAnalysisTable).toBeInTheDocument()
    })
  })
})
