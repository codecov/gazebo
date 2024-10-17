import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import PullBundleAnalysis from './PullBundleAnalysis'

import { TBundleAnalysisComparisonResult } from '../hooks'

vi.mock('./EmptyTable', () => ({
  default: () => <div>EmptyTable</div>,
}))
vi.mock('./PullBundleHeadTable', () => ({
  default: () => <div>PullBundleHeadTable</div>,
}))
vi.mock('./PullBundleComparisonTable', () => ({
  default: () => <div>PullBundleComparisonTable</div>,
}))

const mockPullPageData = (
  compareType: TBundleAnalysisComparisonResult = 'BundleAnalysisComparison',
  headBundleType: string = 'BundleAnalysisReport',
  coverageEnabled: boolean = true,
  bundleAnalysisEnabled: boolean = true
) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      coverageEnabled,
      bundleAnalysisEnabled,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 3,
        },
        head: {
          commitid: '123',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: headBundleType,
            },
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          impactedFilesCount: 4,
          directChangedFilesCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: compareType,
        },
      },
    },
  },
})

const mockSummaryData = {
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
              threeG: 0,
            },
            size: {
              uncompress: 10,
            },
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
      languages: ['javascript'],
      testAnalyticsEnabled: false,
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
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
  compareType?: TBundleAnalysisComparisonResult
  headBundleType?: string
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('PullBundleAnalysis', () => {
  function setup({
    compareType = 'BundleAnalysisComparison',
    headBundleType = 'BundleAnalysisReport',
    coverageEnabled = false,
    bundleAnalysisEnabled = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullPageData', (info) => {
        return HttpResponse.json({
          data: mockPullPageData(
            compareType,
            headBundleType,
            coverageEnabled,
            bundleAnalysisEnabled
          ),
        })
      }),
      graphql.query('PullBADropdownSummary', (info) => {
        return HttpResponse.json({ data: mockSummaryData })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({
          data: mockRepoOverview({ coverageEnabled, bundleAnalysisEnabled }),
        })
      })
    )
  }

  describe('coverage is enabled and bundles are enabled', () => {
    describe('returns bundle comparison type', () => {
      it('does not render bundle summary', async () => {
        setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const message = screen.queryByText(/Bundle report:/)
        expect(message).not.toBeInTheDocument()
      })

      it('displays the PullBundleComparisonTable', async () => {
        setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        const table = await screen.findByText('PullBundleComparisonTable')
        expect(table).toBeInTheDocument()
      })

      it('sends bundle dropdown metrics', async () => {
        setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'pull_request_page.bundle_dropdown.opened',
            1,
            undefined
          )
        )
      })
    })

    describe('return first pull request typename', () => {
      it('does not render summary', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const message = screen.queryByText(/Bundle report:/)
        expect(message).not.toBeInTheDocument()
      })

      it('renders first pull banner', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const firstPullBanner = await screen.findByText(
          /Welcome to bundle analysis/
        )
        expect(firstPullBanner).toBeInTheDocument()
      })

      it('renders empty table', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const emptyTable = await screen.findByText('EmptyTable')
        expect(emptyTable).toBeInTheDocument()
      })
    })

    describe('returns error comparison type', () => {
      it('does not render summary', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const loader = await screen.findByText('Loading')
        await waitForElementToBeRemoved(loader)

        const message = screen.queryByText(/Bundle report:/)
        expect(message).not.toBeInTheDocument()
      })

      it('renders error banner', async () => {
        setup({
          compareType: 'MissingBaseCommit',
          coverageEnabled: true,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const banner = await screen.findByText(/Missing Base Commit/)
        expect(banner).toBeInTheDocument()
      })

      describe('there is no bundle report on head', () => {
        it('renders empty table', async () => {
          setup({
            compareType: 'MissingBaseCommit',
            headBundleType: 'MissingHeadReport',
            coverageEnabled: true,
            bundleAnalysisEnabled: true,
          })
          render(<PullBundleAnalysis />, { wrapper })

          const emptyTable = await screen.findByText('EmptyTable')
          expect(emptyTable).toBeInTheDocument()
        })
      })

      describe('there is a bundle report on head', () => {
        it('renders the PullBundleHeadTable', async () => {
          setup({
            compareType: 'MissingBaseCommit',
            coverageEnabled: true,
            bundleAnalysisEnabled: true,
          })
          render(<PullBundleAnalysis />, { wrapper })

          const pullHeadTable = await screen.findByText('PullBundleHeadTable')
          expect(pullHeadTable).toBeInTheDocument()
        })
      })
    })
  })

  describe('coverage is disabled and bundles are enabled', () => {
    describe('returns bundle comparison type', () => {
      it('renders bundle summary', async () => {
        setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        const message = await screen.findByText(/Bundle report:/)
        expect(message).toBeInTheDocument()
      })

      it('displays the PullBundleComparisonTable', async () => {
        setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        const table = await screen.findByText('PullBundleComparisonTable')
        expect(table).toBeInTheDocument()
      })

      it('sends bundle dropdown metrics', async () => {
        setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
        render(<PullBundleAnalysis />, { wrapper })

        await waitFor(() =>
          expect(Sentry.metrics.increment).toHaveBeenCalledWith(
            'pull_request_page.bundle_page.visited_page',
            1,
            undefined
          )
        )
      })
    })

    describe('return first pull request typename', () => {
      it('renders summary', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const message = await screen.findByText(/Bundle report:/)
        expect(message).toBeInTheDocument()
      })

      it('renders first pull banner', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const firstPullBanner = await screen.findByText(
          /Welcome to bundle analysis/
        )
        expect(firstPullBanner).toBeInTheDocument()
      })

      it('renders empty table', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const emptyTable = await screen.findByText('EmptyTable')
        expect(emptyTable).toBeInTheDocument()
      })
    })

    describe('returns error comparison type', () => {
      it('renders summary', async () => {
        setup({
          compareType: 'FirstPullRequest',
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const message = await screen.findByText(/Bundle report:/)
        expect(message).toBeInTheDocument()
      })

      it('renders error banner', async () => {
        setup({
          compareType: 'MissingBaseCommit',
          coverageEnabled: false,
          bundleAnalysisEnabled: true,
        })
        render(<PullBundleAnalysis />, { wrapper })

        const banner = await screen.findByText(/Missing Base Commit/)
        expect(banner).toBeInTheDocument()
      })

      describe('there is no bundle report on head', () => {
        it('renders empty table', async () => {
          setup({
            compareType: 'MissingBaseCommit',
            headBundleType: 'MissingHeadReport',
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<PullBundleAnalysis />, { wrapper })

          const emptyTable = await screen.findByText('EmptyTable')
          expect(emptyTable).toBeInTheDocument()
        })
      })

      describe('there is a bundle report on head', () => {
        it('renders the PullBundleHeadTable', async () => {
          setup({
            compareType: 'MissingBaseCommit',
            coverageEnabled: false,
            bundleAnalysisEnabled: true,
          })
          render(<PullBundleAnalysis />, { wrapper })

          const pullBundleHeadTable = await screen.findByText(
            'PullBundleHeadTable'
          )
          expect(pullBundleHeadTable).toBeInTheDocument()
        })
      })
    })
  })
})
