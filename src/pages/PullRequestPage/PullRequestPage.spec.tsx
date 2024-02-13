import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames, TTierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import PullRequestPage from './PullRequestPage'

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  multipleTiers: boolean
  bundleAnalysisPrAndCommitPages: boolean
}>

jest.mock('./Header', () => () => 'Header')
jest.mock('./PullCoverage', () => () => 'PullCoverage')
jest.mock('./PullBundleAnalysis', () => () => 'PullBundleAnalysis')
jest.mock('shared/featureFlags')

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
  head: {
    commitid: '123',
  },
  compareWithBase: {
    __typename: 'Comparison',
    impactedFilesCount: 4,
    indirectChangedFilesCount: 0,
    flagComparisonsCount: 1,
    componentComparisonsCount: 6,
    directChangedFilesCount: 0,
  },
}

const mockPullPageDataTeam = {
  pullId: 877,
  head: {
    commitid: '123',
  },
  compareWithBase: {
    __typename: 'Comparison',
    impactedFilesCount: 4,
    directChangedFilesCount: 0,
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
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          sizeDelta: 1,
          loadTimeDelta: 2,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo/pull/12'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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
    mockedUseFlags.mockReturnValue({
      multipleTiers: true,
      bundleAnalysisPrAndCommitPages: true,
    })

    server.use(
      graphql.query('PullHeadData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullHeadData))
      ),
      graphql.query('PullPageData', (req, res, ctx) => {
        if (req.variables.isTeamPlan) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'Repository',
                  coverageEnabled,
                  bundleAnalysisEnabled,
                  pull: mockPullPageDataTeam,
                },
              },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                coverageEnabled,
                bundleAnalysisEnabled,
                pull: pullData,
              },
            },
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
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: tierValue } },
          })
        )
      }),
      graphql.query('PullCoverageDropdownSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockPullCoverageDropdownSummary))
      }),
      graphql.query('PullBADropdownSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockPullBADropdownSummary))
      })
    )
  }

  describe('when pull data is available', () => {
    it('renders breadcrumb', async () => {
      setup({})
      render(<PullRequestPage />, { wrapper: wrapper() })

      const org = await screen.findByRole('link', { name: 'test-org' })
      expect(org).toBeInTheDocument()
      expect(org).toHaveAttribute('href', '/gh/test-org')

      const repo = await screen.findByRole('link', { name: 'test-repo' })
      expect(repo).toBeInTheDocument()
      expect(repo).toHaveAttribute('href', '/gh/test-org/test-repo')

      const pulls = await screen.findByRole('link', { name: 'Pulls' })
      expect(pulls).toBeInTheDocument()
      expect(pulls).toHaveAttribute('href', '/gh/test-org/test-repo/pulls')

      const pullId = await screen.findByText('12')
      expect(pullId).toBeInTheDocument()
    })

    it('renders header', async () => {
      setup({})
      render(<PullRequestPage />, { wrapper: wrapper() })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

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

  describe('when user is on team plan', () => {
    it('renders the page for team tier', async () => {
      setup({
        tierValue: TierNames.TEAM,
        privateRepo: true,
      })
      render(<PullRequestPage />, { wrapper: wrapper() })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()

      const org = await screen.findByRole('link', { name: 'test-org' })
      expect(org).toBeInTheDocument()
      expect(org).toHaveAttribute('href', '/gh/test-org')

      const repo = await screen.findByRole('link', { name: 'test-repo' })
      expect(repo).toBeInTheDocument()
      expect(repo).toHaveAttribute('href', '/gh/test-org/test-repo')

      const pulls = await screen.findByRole('link', { name: 'Pulls' })
      expect(pulls).toBeInTheDocument()
      expect(pulls).toHaveAttribute('href', '/gh/test-org/test-repo/pulls')

      const pullId = await screen.findByText('12')
      expect(pullId).toBeInTheDocument()
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
})
