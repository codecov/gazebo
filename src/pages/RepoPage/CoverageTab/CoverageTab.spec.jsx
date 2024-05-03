import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import CoverageTab from './CoverageTab'

jest.mock('shared/featureFlags')
jest.mock('./Summary', () => () => 'Summary')
jest.mock('./SummaryTeamPlan', () => () => 'SummaryTeamPlan')

const mockRepoSettings = (isPrivate = false) => ({
  owner: {
    repository: {
      defaultBranch: 'master',
      private: isPrivate,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
    },
  },
})

const mockRepo = (isPrivate = false, isFirstPullRequest = false) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    isAdmin: null,
    isCurrentUserActivated: null,
    repository: {
      __typename: 'Repository',
      private: isPrivate,
      uploadToken: '9e6a6189-20f1-482d-ab62-ecfaa2629295',
      defaultBranch: 'main',
      yaml: '',
      activated: false,
      oldestCommitAt: '',
      active: true,
      isFirstPullRequest,
    },
  },
})

const repoConfigMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const treeMock = [{ name: 'repoName', children: [] }]

const overviewMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
    },
  },
}

const branchesMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [
          {
            node: {
              name: 'main',
              head: {
                commitid: '1',
              },
            },
          },
          {
            node: {
              name: 'dummy',
              head: {
                commitid: '2',
              },
            },
          },
          {
            node: {
              name: 'dummy2',
              head: {
                commitid: '3',
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'someEndCursor',
        },
      },
    },
  },
}

const branchMock = {
  __typename: 'Repository',
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const branchesContentsMock = {
  owner: {
    username: 'critical-role',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            results: [
              {
                name: 'src',
                path: 'src',
                percentCovered: 100.0,
                __typename: 'PathContentDir',
              },
            ],
          },
        },
      },
    },
  },
}

const mockBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      measurements: [
        {
          timestamp: '2023-01-01T00:00:00+00:00',
          max: 85,
        },
        {
          timestamp: '2023-01-02T00:00:00+00:00',
          max: 80,
        },
        {
          timestamp: '2023-01-03T00:00:00+00:00',
          max: 90,
        },
        {
          timestamp: '2023-01-04T00:00:00+00:00',
          max: 100,
        },
      ],
    },
  },
}

const mockOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['JavaScript'],
    },
  },
}

const mockCoverageTabData = (fileCount = 10) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          totals: {
            fileCount,
          },
        },
      },
    },
  },
})

const mockBranchComponents = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: {
          commitid: 'commit-123',
          components: [
            {
              id: 'compOneId',
              name: 'compOneName',
            },
            {
              id: 'compTwoId',
              name: 'compTwoName',
            },
          ],
        },
      },
    },
  },
}

const mockFlagSelect = {
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

const mockBackfillFlag = {
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = ['/gh/codecov/cool-repo/tree/main']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo" exact={true}>
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('Coverage Tab', () => {
  function setup(
    {
      isPrivate = false,
      tierValue = TierNames.PRO,
      isFirstPullRequest = false,
      fileCount,
    } = {
      repoData: mockRepo,
      isFirstPullRequest: false,
      isPrivate: false,
      tierValue: TierNames.PRO,
      fileCount: 10,
    }
  ) {
    useFlags.mockReturnValue({
      multipleTiers: true,
    })

    server.use(
      graphql.query('GetRepo', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockRepo(isPrivate, isFirstPullRequest)))
      ),
      graphql.query('GetBranches', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(branchesMock))
      ),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { __typename: 'Repository', ...branchMock } },
          })
        )
      ),
      graphql.query('BranchContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(branchesContentsMock))
      ),
      graphql.query('RepoConfig', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(repoConfigMock))
      ),
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(overviewMock))
      ),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({}))
      ),
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockBranchMeasurements))
      ),
      graphql.query('BackfillFlagMemberships', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockBackfillFlag))
      ),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: tierValue } } })
        )
      }),
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoSettings(isPrivate)))
      }),
      graphql.query('CoverageTabData', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockCoverageTabData(fileCount)))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      }),
      graphql.query('GetBranchComponents', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBranchComponents))
      }),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockFlagSelect))
      }),
      rest.get(
        '/internal/:provider/:owner/:repo/coverage/tree',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(treeMock))
        }
      ),
      rest.post(
        '/internal/charts/:provider/:owner/coverage/:repo',
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: {} }))
        }
      )
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('file count is under 10_000', () => {
    it('renders the sunburst chart', async () => {
      setup({ fileCount: 100 })
      render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

      expect(await screen.findByText(/Hide Chart/)).toBeTruthy()
      const hideChart = screen.getByText(/Hide Chart/)
      expect(hideChart).toBeInTheDocument()

      expect(await screen.findByTestId('sunburst')).toBeTruthy()
      const sunburst = screen.getByTestId('sunburst')
      expect(sunburst).toBeInTheDocument()

      expect(await screen.findByTestId('coverage-area-chart')).toBeTruthy()
      const coverageAreaChart = screen.getByTestId('coverage-area-chart')
      expect(coverageAreaChart).toBeInTheDocument()
    }, 60000)
  })

  describe('file count is above 10_000', () => {
    it('does not render the sunburst chart', async () => {
      setup({ fileCount: 100_000 })
      render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

      const hideChart = await screen.findByText(/Hide Chart/)
      expect(hideChart).toBeInTheDocument()

      const sunburst = screen.queryByTestId('sunburst')
      expect(sunburst).not.toBeInTheDocument()

      const coverageAreaChart = await screen.findByTestId('coverage-area-chart')
      expect(coverageAreaChart).toBeInTheDocument()
    })
  })

  it('renders default summary', async () => {
    setup()

    render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

    const summary = screen.getByText(/Summary/)
    expect(summary).toBeInTheDocument()
  })

  describe('when the repo is private and org is on team plan', () => {
    it('renders team summary', async () => {
      setup({ isPrivate: true, tierValue: TierNames.TEAM })

      render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

      const summary = await screen.findByText(/SummaryTeamPlan/)
      expect(summary).toBeInTheDocument()
    })

    it('does not render coverage chart', async () => {
      setup({ isPrivate: true, tierValue: TierNames.TEAM })

      render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

      const coverageChart = screen.queryByTestId('coverage-area-chart')
      expect(coverageChart).not.toBeInTheDocument()
    })
  })

  it('renders first pull request banner', async () => {
    setup({ isFirstPullRequest: true })

    render(<CoverageTab />, { wrapper: wrapper(['/gh/test-org/repoName']) })

    const firstPullRequestBanner = await screen.findByText(
      /Once merged to your default branch, Codecov will show your report results on this dashboard./
    )
    expect(firstPullRequestBanner).toBeInTheDocument()
  })
})
