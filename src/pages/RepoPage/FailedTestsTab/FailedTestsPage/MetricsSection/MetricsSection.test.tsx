import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { PropsWithChildren, Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import MetricsSection from './MetricsSection'

const mockAggResponse = (
  planValue = 'users-enterprisem',
  isPrivate = false
) => ({
  owner: {
    plan: {
      value: planValue,
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
          flakeRate: 8,
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
  function setup(planValue = 'users-enterprisem', isPrivate = false) {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetTestResultsAggregates', (info) => {
        return HttpResponse.json({
          data: mockAggResponse(planValue, isPrivate),
        })
      }),
      graphql.query('GetFlakeAggregates', (info) => {
        return HttpResponse.json({ data: mockFlakeAggResponse })
      })
    )
    return { user }
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
      const context = await screen.findByText('24m 50s')

      expect(title).toBeInTheDocument()
      expect(context).toBeInTheDocument()
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
          parameter: 'SLOWEST_TESTS',
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
          parameter: 'FLAKY_TESTS',
        })
      })
    })

    it('renders average flake rate card', async () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const title = await screen.findByText('Avg. flake rate')
      const context = await screen.findByText('8%')
      const description = await screen.findByText(
        'The average flake rate across all branches.'
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

        const title = await screen.findByText('Failures')
        const context = await screen.findByText(1)
        const description = await screen.findByText(
          'The number of test failures across all branches.'
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
          parameter: 'FAILED_TESTS',
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
          parameter: 'SKIPPED_TESTS',
        })
      })
    })
  })

  describe('when on team plan', () => {
    describe('when repo is private', () => {
      it('does not render total flaky tests card', async () => {
        setup('users-teamm', true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).not.toBeInTheDocument()
      })

      it('does not render avg flaky tests card', async () => {
        setup('users-teamm', true)
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
        setup('users-teamm', false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).toBeInTheDocument()
      })

      it('renders avg flaky tests card', async () => {
        setup('users-teamm', false)
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
        setup('users-basic', true)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).not.toBeInTheDocument()
      })

      it('does not render avg flaky tests card', async () => {
        setup('users-basic', true)
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
        setup('users-basic', false)
        render(<MetricsSection />, {
          wrapper: wrapper('/gh/owner/repo/tests/main'),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeFalsy())

        const flakeAggregates = screen.queryByText('Flaky tests')
        expect(flakeAggregates).toBeInTheDocument()
      })

      it('renders avg flaky tests card', async () => {
        setup('users-basic', false)
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
