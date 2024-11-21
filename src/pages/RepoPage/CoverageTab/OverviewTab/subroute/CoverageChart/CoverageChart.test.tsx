import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock, type MockInstance } from 'vitest'

import CoverageChart from './CoverageChart'

declare global {
  interface Window {
    ResizeObserver: unknown
  }
}

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      // @ts-expect-error - something is off with the import actual but this does exist, and this mock does work
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  }
})

const wrapper =
  (
    initialEntries = ['/gh/codecov/bells-hells/tree/main']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

let resizeObserverMock: Mock
beforeEach(() => {
  /**
   * ResizeObserver is not available, so we have to create a mock to avoid error coming
   * from `react-resize-detector`.
   * @see https://github.com/maslianok/react-resize-detector/issues/145
   *
   * This mock also allow us to use {@link notifyResizeObserverChange} to fire changes
   * from inside our test.
   */
  resizeObserverMock = vi.fn().mockImplementation(() => {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
  })

  // @ts-expect-error - we're deleting the window resize observer which is being replaced by a mock
  delete window.ResizeObserver

  window.ResizeObserver = resizeObserverMock
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
          { node: { name: 'main', head: { commitid: '1' } } },
          { node: { name: 'dummy', head: { commitid: '2' } } },
          { node: { name: 'dummy2', head: { commitid: '3' } } },
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
      { timestamp: '2023-01-01T00:00:00+00:00', max: 85 },
      { timestamp: '2023-01-02T00:00:00+00:00', max: 80 },
      { timestamp: '2023-01-03T00:00:00+00:00', max: 90 },
      { timestamp: '2023-01-04T00:00:00+00:00', max: 100 },
    ],
  },
}

const branchMock = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: { commitid: '321fdsa' },
      },
    },
  },
}

interface SetupArgs {
  coverageRepoStatus?: number
  repoOverviewData?: typeof overviewMock
  branchMeasurementsData?: typeof mockBranchMeasurements
  branchesData?: typeof branchesMock
  noData?: boolean
}

describe('CoverageChart', () => {
  function setup({
    repoOverviewData = overviewMock,
    branchMeasurementsData = mockBranchMeasurements,
    branchesData = branchesMock,
    coverageRepoStatus,
    noData = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: repoOverviewData })
      }),
      graphql.query('GetBranches', () => {
        return HttpResponse.json({ data: branchesData })
      }),
      graphql.query('GetBranch', () => {
        return HttpResponse.json({ data: branchMock })
      }),
      graphql.query('GetBranchCoverageMeasurements', () => {
        if (coverageRepoStatus) {
          return HttpResponse.json(
            { errors: [{ message: 'error' }] },
            { status: 500 }
          )
        } else if (noData) {
          return HttpResponse.json({
            data: {
              owner: {
                repository: {
                  __typename: 'Repository',
                  coverageAnalytics: {
                    measurements: [],
                  },
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: { owner: { repository: branchMeasurementsData } },
        })
      })
    )
  }

  describe('the chart is rendered', () => {
    it('renders the chart', async () => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
      })
      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const chart = await screen.findByTestId('chart-container')
      expect(chart).toBeInTheDocument()
    })

    it('renders the legend', async () => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
      })

      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const legend = await screen.findByTestId('chart-legend-content')
      expect(legend).toBeInTheDocument()

      const coverage = await within(legend).findByText('Coverage')
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('not enough data message', () => {
    it('renders not enough data message', async () => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
        noData: true,
      })
      render(<CoverageChart />, {
        wrapper: wrapper(),
      })

      const message = await screen.findByText(
        'Not enough coverage data to display chart.'
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('chart failed to load message', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('renders failure to user', async () => {
      setup({
        repoOverviewData: overviewMock,
        branchesData: branchesMock,
        branchMeasurementsData: {
          __typename: 'Repository',
          // @ts-expect-error - we're testing the error case
          measurements: 'random value',
        },
        coverageRepoStatus: 500,
      })
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
