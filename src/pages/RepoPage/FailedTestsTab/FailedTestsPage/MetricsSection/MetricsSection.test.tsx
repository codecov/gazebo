import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { PlanName, Plans } from 'shared/utils/billing'

import MetricsSection, { historicalTrendToCopy } from './MetricsSection'

import { TestResultsFilterParameter } from '../hooks/useInfiniteTestResults/useInfiniteTestResults'

const mockAggResponse = (
  planValue: PlanName = Plans.USERS_ENTERPRISEM,
  isPrivate = false
) => ({
  owner: {
    plan: {
      value: planValue,
      isFreePlan: planValue === Plans.USERS_DEVELOPER,
      isTeamPlan:
        planValue === Plans.USERS_TEAMM || planValue === Plans.USERS_TEAMY,
    },
    repository: {
      __typename: 'Repository',
      defaultBranch: 'main',
      private: isPrivate,
      testAnalytics: {
        testResultsAggregates: {
          totalDuration: 1490,
          totalDurationPercentChange: 25.0,
          slowestTestsDuration: 111.11,
          slowestTestsDurationPercentChange: 0.0,
          totalSlowTests: 12,
          totalSlowTestsPercentChange: 15.1,
          totalFails: 1,
          totalFailsPercentChange: 100.0,
          totalSkips: 20,
          totalSkipsPercentChange: 0.0,
        },
      },
    },
  },
})

const mockFlakeAggResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      testAnalytics: {
        flakeAggregates: {
          flakeCount: 88,
          flakeCountPercentChange: 10.0,
          flakeRate: 8.412412312,
          flakeRatePercentChange: 5.0,
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})

let testLocation: ReturnType<typeof useLocation>
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
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
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
  function setup(
    planValue: PlanName = Plans.USERS_ENTERPRISEM,
    isPrivate = false
  ) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetTestResultsAggregates', () => {
        return HttpResponse.json({
          data: mockAggResponse(planValue, isPrivate),
        })
      }),
      graphql.query('GetFlakeAggregates', () => {
        return HttpResponse.json({ data: mockFlakeAggResponse })
      })
    )
    return { user }
  }

  describe('historicalTrendToCopy', () => {
    it('returns correct values for intervals', () => {
      expect(historicalTrendToCopy()).toBe('30 days')
      expect(historicalTrendToCopy('INTERVAL_30_DAY')).toBe('30 days')
      expect(historicalTrendToCopy('INTERVAL_7_DAY')).toBe('7 days')
      expect(historicalTrendToCopy('INTERVAL_1_DAY')).toBe('1 day')
    })
  })

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

      const title = await screen.findByText('Total test run time')
      const context = await screen.findByText('24m 50s')
      const description = await screen.findByText(
        'The cumulative CI time spent running tests over the last 30 days.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    describe('slowest tests card', () => {
      it('renders slowest tests card', async () => {
        setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        const title = await screen.findByText('Slowest tests')
        const context = await screen.findByText(12)
        const description = await screen.findByText(
          'The slowest 12 tests take 1m 51s to run.'
        )

        expect(title).toBeInTheDocument()
        expect(context).toBeInTheDocument()
        expect(description).toBeInTheDocument()
      })

      it('can update the location params on button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText('12')
        expect(select).toBeInTheDocument()
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: TestResultsFilterParameter.SLOWEST_TESTS,
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })

      it('removes the location param on second button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText('12')
        expect(select).toBeInTheDocument()

        await user.click(select)
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: '',
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })
    })

    describe('flaky tests card', () => {
      it('renders total flaky tests card', async () => {
        setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        const title = await screen.findByText('Flaky tests')
        const context = await screen.findByText(88)
        const description = await screen.findByText(
          'The number of flaky tests in your test suite.'
        )

        expect(title).toBeInTheDocument()
        expect(context).toBeInTheDocument()
        expect(description).toBeInTheDocument()
      })

      it('can update the location params on button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(88)
        expect(select).toBeInTheDocument()
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: TestResultsFilterParameter.FLAKY_TESTS,
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })

      it('removes the location param on second button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(88)
        expect(select).toBeInTheDocument()

        await user.click(select)
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: '',
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })
    })

    it('renders average flake rate card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Avg. flake rate')
      const context = await screen.findByText('8.41%')
      const description = await screen.findByText(
        'The average flake rate on your default branch.'
      )

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })

    describe('total failures card', () => {
      it('renders total failures card', async () => {
        setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        const title = await screen.findByText('Cumulative Failures')
        const context = await screen.findByText(1)
        const description = await screen.findByText(
          'The number of test failures on your default branch.'
        )

        expect(title).toBeInTheDocument()
        expect(context).toBeInTheDocument()
        expect(description).toBeInTheDocument()
      })

      it('can update the location params on button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(1)
        expect(select).toBeInTheDocument()
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: TestResultsFilterParameter.FAILED_TESTS,
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })

      it('removes the location param on second button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(1)
        expect(select).toBeInTheDocument()

        await user.click(select)
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: '',
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })
    })

    describe('total skips card', () => {
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

      it('can update the location params on button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(20)
        expect(select).toBeInTheDocument()
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: TestResultsFilterParameter.SKIPPED_TESTS,
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })

      it('removes the location param on second button click', async () => {
        const { user } = setup()
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })
        const select = await screen.findByText(20)
        expect(select).toBeInTheDocument()

        await user.click(select)
        await user.click(select)

        expect(testLocation?.state).toStrictEqual({
          parameter: '',
          flags: [],
          historicalTrend: '',
          term: '',
          testSuites: [],
        })
      })
    })
  })

  describe('when on team plan', () => {
    describe('when repo is private', () => {
      it('does not render total flaky tests card', async () => {
        setup(Plans.USERS_TEAMM, true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).not.toBeInTheDocument()
      })

      it('does not render avg flaky tests card', async () => {
        setup(Plans.USERS_TEAMM, true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Avg. flake rate')
        expect(flakeAggregates).not.toBeInTheDocument()
      })
    })

    describe('when repo is public', () => {
      it('renders total flaky tests card', async () => {
        setup(Plans.USERS_TEAMM, false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).toBeInTheDocument()
      })

      it('renders avg flaky tests card', async () => {
        setup(Plans.USERS_TEAMM, false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Avg. flake rate')
        expect(flakeAggregates).toBeInTheDocument()
      })
    })
  })

  describe('when on free plan', () => {
    describe('when repo is private', () => {
      it('does not render total flaky tests card', async () => {
        setup(Plans.USERS_DEVELOPER, true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).not.toBeInTheDocument()
      })

      it('does not render avg flaky tests card', async () => {
        setup(Plans.USERS_DEVELOPER, true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Avg. flake rate')
        expect(flakeAggregates).not.toBeInTheDocument()
      })
    })

    describe('when repo is public', () => {
      it('renders total flaky tests card', async () => {
        setup(Plans.USERS_DEVELOPER, false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).toBeInTheDocument()
      })

      it('renders avg flaky tests card', async () => {
        setup(Plans.USERS_DEVELOPER, false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Avg. flake rate')
        expect(flakeAggregates).toBeInTheDocument()
      })
    })
  })
})
