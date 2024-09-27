import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageChart from './CoverageChart'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/codecov/bells-hells/tree/main']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
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

const overviewMock = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
      testAnalyticsEnabled: false,
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

const mockBranchMeasurements = {
  __typename: 'Repository',
  coverageAnalytics: {
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
}

const branchMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: {
          commitid: '321fdsa',
        },
      },
    },
  },
}

describe('CoverageChart', () => {
  function setup({
    repoOverviewData = overviewMock,
    branchMeasurementsData = mockBranchMeasurements,
    branchesData = branchesMock,
    coverageRepoStatus,
  }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(repoOverviewData))
      }),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(branchesData))
      }),
      graphql.query('GetBranch', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(branchMock))
      ),
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) => {
        if (coverageRepoStatus) {
          return res(ctx.status(400), ctx.errors({ owner: null }))
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: { coverageAnalytics: { branchMeasurementsData } },
            },
          })
        )
      })
    )
  }

  describe('Chart with increased coverage', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
        branchMeasurementsData: {
          __typename: 'Repository',
          coverageAnalytics: {
            measurements: [
              { timestamp: '2020-01-15T20:18:39.413Z', max: 20 },
              { timestamp: '2020-01-17T20:18:39.413Z', max: 50 },
            ],
          },
        },
      })
    })

    it('renders a screen reader description', async () => {
      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const chartDesc = await screen.findByText(
        'bells-hells coverage chart from Jan 15, 2020 to Jan 17, 2020, coverage change is +20%'
      )

      expect(chartDesc).toBeInTheDocument()
    })
  })

  describe('Chart with reduced coverage', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
        branchMeasurementsData: {
          __typename: 'Repository',
          coverageAnalytics: {
            measurements: [
              { timestamp: '2020-01-15T20:18:39.413Z', max: 20 },
              { timestamp: '2020-01-17T20:18:39.413Z', max: 0 },
            ],
          },
        },
      })
    })

    it('renders a screen reader description', async () => {
      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const chartDesc = await screen.findByText(
        'bells-hells coverage chart from Jan 15, 2020 to Jan 17, 2020, coverage change is -20%'
      )

      expect(chartDesc).toBeInTheDocument()
    })
  })

  describe('chart failed to load message', () => {
    beforeEach(() => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
        branchMeasurementsData: {
          __typename: 'Repository',
          measurements: [{ timestamp: '2020-01-15T20:18:39.413Z', max: 20 }],
        },
        coverageRepoStatus: 500,
      })
    })

    it('renders failure to user', async () => {
      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const failMessage = await screen.findByText(
        /The coverage chart failed to load./
      )

      expect(failMessage).toBeInTheDocument()
    })
  })
})
