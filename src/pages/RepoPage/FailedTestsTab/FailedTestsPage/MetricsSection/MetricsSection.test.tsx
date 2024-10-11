import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import MetricsSection from './MetricsSection'

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockAggResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      testAnalytics: {
        testResultsAggregates: {
          totalDuration: 1.1,
          totalDurationPercentChange: 25.0,
          slowestTestsDuration: 111.11,
          slowestTestsDurationPercentChange: 0.0,
          totalFails: 1,
          totalFailsPercentChange: 100.0,
          totalSkips: 20,
          totalSkipsPercentChange: 0.0,
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/tests',
            '/:provider/:owner/:repo/tests/:branch',
          ]}
          exact
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('MetricsSection', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('GetTestResultsAggregates', (info) => {
        return HttpResponse.json({ data: mockAggResponse })
      })
    )
  }

  describe('when not on default branch', () => {
    it('does not render component', () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/ight'),
      })

      const runEfficiency = screen.queryByText('Improve CI Run Efficiency')
      const testPerf = screen.queryByText('Improve Test Performance')
      expect(runEfficiency).not.toBeInTheDocument()
      expect(testPerf).not.toBeInTheDocument()
    })
  })

  describe('when on default branch', () => {
    it('renders subheaders', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const runEfficiency = await screen.findByText('Improve CI Run Efficiency')
      const testPerf = await screen.findByText('Improve Test Performance')
      expect(runEfficiency).toBeInTheDocument()
      expect(testPerf).toBeInTheDocument()
    })

    it('renders total test runtime card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Test run time')
      const context = await screen.findByText(1.1)
      const description = await screen.findByText(
        'Increased by [12.5hr] in the last [30 days]'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('renders slowest tests card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Slowest tests')
      const context = await screen.findByText(6)
      const description = await screen.findByText(
        'The slowest 6 tests take 111.11 to run.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('renders total flaky tests card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Flaky tests')
      const context = await screen.findByText(88)
      const description = await screen.findByText(
        '*The total rerun time for flaky tests is [50hr].'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('renders average flake rate card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Avg. flake rate')
      const context = await screen.findByText('8%')
      const description = await screen.findByText(
        'On average, a flaky test ran [20] times before it passed.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('renders total failures card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Failures')
      const context = await screen.findByText(1)
      const description = await screen.findByText(
        'The number of test failures across all branches.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    it('renders total skips card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Skipped tests')
      const context = await screen.findByText(20)
      const description = await screen.findByText(
        'The number of skipped tests in your test suite.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })
  })
})
