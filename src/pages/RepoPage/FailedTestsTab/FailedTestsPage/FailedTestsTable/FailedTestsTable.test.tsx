import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import FailedTestsTable from './FailedTestsTable'

import {
  OrderingDirection,
  OrderingParameter,
} from '../hooks/useInfiniteTestResults'

vi.mock('../TableHeader/TableHeader', () => ({
  default: () => 'Table Header',
}))

const node1 = {
  updatedAt: '2023-01-01T00:00:00Z',
  name: 'test-1',
  commitsFailed: 1,
  failureRate: 0.1,
  flakeRate: 0.0,
  avgDuration: 10,
  totalDuration: 100,
  totalFailCount: 5,
  totalFlakyFailCount: 14,
  totalPassCount: 6,
  totalSkipCount: 7,
}

const node2 = {
  updatedAt: '2023-01-02T00:00:00Z',
  name: 'test-2',
  commitsFailed: 2,
  failureRate: 0.2,
  flakeRate: 0.2,
  avgDuration: 20,
  totalDuration: 200,
  totalFailCount: 8,
  totalFlakyFailCount: 15,
  totalPassCount: 9,
  totalSkipCount: 10,
}

const node3 = {
  updatedAt: '2023-01-03T00:00:00Z',
  name: 'test-3',
  commitsFailed: 3,
  failureRate: 0.3,
  flakeRate: 0.1,
  avgDuration: 30,
  totalDuration: 300,
  totalFailCount: 11,
  totalFlakyFailCount: 16,
  totalPassCount: 12,
  totalSkipCount: 13,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: false,
    },
  },
})

const server = setupServer()
const wrapper =
  (
    initialEntries: string[] = ['/gh/codecov/repo/tests']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/tests" exact>
          {children}
        </Route>
        <Route path="/:provider/:owner/:repo/tests/:branch" exact>
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

let consoleError: any
let consoleWarn: any

class ResizeObserverMock {
  [x: string]: any
  constructor(cb: any) {
    this.cb = cb
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }])
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

global.window.ResizeObserver = ResizeObserverMock

beforeAll(() => {
  server.listen()
  // Mock console.error and console.warn
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  vi.useFakeTimers().setSystemTime(new Date('2024-06-01T00:00:00Z'))
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
  // Restore console methods
  consoleError.mockRestore()
  consoleWarn.mockRestore()
  vi.useRealTimers()
})

interface SetupArgs {
  noEntries?: boolean
  bundleAnalysisEnabled?: boolean
  planValue?: string
  isPrivate?: boolean
  isFirstPullRequest?: boolean
}

describe('FailedTestsTable', () => {
  function setup({
    noEntries = false,
    planValue = Plans.USERS_ENTERPRISEM,
    isPrivate = false,
    isFirstPullRequest = false,
  }: SetupArgs) {
    const user = userEvent.setup({ delay: null })
    const mockVariables = vi.fn()

    server.use(
      graphql.query('GetTestResults', (info) => {
        mockVariables(info.variables)

        if (noEntries) {
          return HttpResponse.json({
            data: {
              owner: {
                plan: {
                  value: planValue,
                  isFreePlan: planValue === Plans.USERS_DEVELOPER,
                  isTeamPlan:
                    planValue === Plans.USERS_TEAMM ||
                    planValue === Plans.USERS_TEAMY,
                },
                repository: {
                  __typename: 'Repository',
                  private: isPrivate,
                  isFirstPullRequest,
                  defaultBranch: 'main',
                  testAnalytics: {
                    testResults: {
                      edges: [],
                      pageInfo: {
                        hasNextPage: false,
                        endCursor: null,
                      },
                      totalCount: 0,
                    },
                  },
                },
              },
            },
          })
        }

        const dataReturned = {
          owner: {
            plan: {
              value: planValue,
              isFreePlan: planValue === Plans.USERS_DEVELOPER,
              isTeamPlan:
                planValue === Plans.USERS_TEAMM ||
                planValue === Plans.USERS_TEAMY,
            },
            repository: {
              __typename: 'Repository',
              private: isPrivate,
              isFirstPullRequest,
              defaultBranch: 'main',
              testAnalytics: {
                testResults: {
                  edges: info.variables.after
                    ? [{ node: node3 }]
                    : [{ node: node1 }, { node: node2 }],
                  pageInfo: {
                    hasNextPage: info.variables.after ? false : true,
                    endCursor: info.variables.after
                      ? 'aa'
                      : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                  },
                  totalCount: 1234,
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )

    return { user, mockVariables }
  }

  describe('renders table headers', () => {
    describe('when repo is private', () => {
      describe('when plan is team plan', () => {
        it('does not render flake rate column', async () => {
          setup({
            planValue: Plans.USERS_TEAMM,
            isPrivate: true,
          })
          render(<FailedTestsTable />, {
            wrapper: wrapper(),
          })

          const tableData = await screen.findByText('test-1')
          expect(tableData).toBeInTheDocument()

          const flakeRateColumn = screen.queryByText('Flake rate')
          expect(flakeRateColumn).not.toBeInTheDocument()
        })
      })

      describe('when plan is free', () => {
        it('does not render flake rate column', async () => {
          setup({
            planValue: Plans.USERS_DEVELOPER,
            isPrivate: true,
          })
          render(<FailedTestsTable />, {
            wrapper: wrapper(),
          })

          const tableData = await screen.findByText('test-1')
          expect(tableData).toBeInTheDocument()

          const flakeRateColumn = screen.queryByText('Flake rate')
          expect(flakeRateColumn).not.toBeInTheDocument()
        })
      })

      describe('when not on default branch', () => {
        it('does not render flake rate column', async () => {
          setup({})
          render(<FailedTestsTable />, {
            wrapper: wrapper(['/gh/codecov/repo/tests/lol']),
          })

          const tableData = await screen.findByText('test-1')
          expect(tableData).toBeInTheDocument()

          const flakeRateColumn = screen.queryByText('Flake rate')
          expect(flakeRateColumn).not.toBeInTheDocument()
        })
      })
    })

    it('renders each column name', async () => {
      setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const nameColumn = await screen.findByText('Test name')
      expect(nameColumn).toBeInTheDocument()

      const durationColumn = await screen.findByText('Avg. duration')
      expect(durationColumn).toBeInTheDocument()

      const totalDurationColumn = await screen.findByText('Time spent')
      expect(totalDurationColumn).toBeInTheDocument()

      const failureRateColumn = await screen.findByText('Failure rate')
      expect(failureRateColumn).toBeInTheDocument()

      const flakeRateColumn = await screen.findByText('Flake rate')
      expect(flakeRateColumn).toBeInTheDocument()

      const commitFailedColumn = await screen.findByText('Commits failed')
      expect(commitFailedColumn).toBeInTheDocument()

      const lastRunColumn = await screen.findByText('Last run')
      expect(lastRunColumn).toBeInTheDocument()
    })

    it('renders table header', async () => {
      setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const tableHeader = await screen.findByText('Table Header')
      expect(tableHeader).toBeInTheDocument()
    })
  })

  describe('renders table body', () => {
    it('renders the first element', async () => {
      setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const nameColumn = await screen.findByText('test-1')
      expect(nameColumn).toBeInTheDocument()

      const durationColumn = await screen.findByText('10.000s')
      expect(durationColumn).toBeInTheDocument()

      const totalDurationColumn = await screen.findByText('100.000s')
      expect(totalDurationColumn).toBeInTheDocument()

      const failureRateColumn = await screen.findByText('10.00%')
      expect(failureRateColumn).toBeInTheDocument()

      const flakeRateColumn = await screen.findByText('0%')
      expect(flakeRateColumn).toBeInTheDocument()

      const commitFailedColumn = await screen.findByText('1')
      expect(commitFailedColumn).toBeInTheDocument()

      const lastRunColumn = await screen.findAllByText('over 1 year ago')
      expect(lastRunColumn.length).toBeGreaterThan(0)
    })

    it('shows additional info when hovering flake rate', async () => {
      const { user } = setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const flakeRateColumn = await screen.findByText('0%')
      expect(flakeRateColumn).toBeInTheDocument()

      await user.hover(flakeRateColumn)

      const hoverObj = await screen.findAllByText(/6 Passed, 5 Failed /)

      expect(hoverObj.length).toBeGreaterThan(0)
    })
  })

  describe('when first pull request', () => {
    describe('when there are no test results', () => {
      it('renders no data message', async () => {
        setup({
          isFirstPullRequest: true,
          noEntries: true,
        })
        render(<FailedTestsTable />, {
          wrapper: wrapper(),
        })

        const noDataMessage = await screen.findByText('No data yet')
        expect(noDataMessage).toBeInTheDocument()

        const mergeIntoMainMessage = await screen.findByText(
          'To see data for the main branch, merge your PR into the main branch.'
        )
        expect(mergeIntoMainMessage).toBeInTheDocument()
      })
    })

    describe('there are test results', () => {
      it('renders data in the table', async () => {
        setup({ isFirstPullRequest: true })
        render(<FailedTestsTable />, {
          wrapper: wrapper(),
        })

        const nameColumn = await screen.findByText('test-1')
        expect(nameColumn).toBeInTheDocument()

        const durationColumn = await screen.findByText('10.000s')
        expect(durationColumn).toBeInTheDocument()

        const totalDurationColumn = await screen.findByText('100.000s')
        expect(totalDurationColumn).toBeInTheDocument()

        const failureRateColumn = await screen.findByText('10.00%')
        expect(failureRateColumn).toBeInTheDocument()

        const flakeRateColumn = await screen.findByText('0%')
        expect(flakeRateColumn).toBeInTheDocument()

        const commitFailedColumn = await screen.findByText('1')
        expect(commitFailedColumn).toBeInTheDocument()

        const lastRunColumn = await screen.findAllByText('over 1 year ago')
        expect(lastRunColumn.length).toBeGreaterThan(0)
      })
    })
  })

  describe('no data is returned', () => {
    it('still returns an empty table', async () => {
      setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const tableBody = screen.getByTestId('failed-tests-table-body')
      // waiting for the loading element to be removed
      await waitFor(() => expect(tableBody).toBeEmptyDOMElement())
    })
  })

  describe('ability to sort', () => {
    it('can sort on duration column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const durationColumn = await screen.findByText('Avg. duration')
      await user.click(durationColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.AVG_DURATION,
            },
          })
        )
      })

      await user.click(durationColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.AVG_DURATION,
            },
          })
        )
      })
    })

    it('can sort on time spent column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const totalDurationColumn = await screen.findByText('Time spent')
      await user.click(totalDurationColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.TOTAL_DURATION,
            },
          })
        )
      })

      await user.click(totalDurationColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.TOTAL_DURATION,
            },
          })
        )
      })
    })

    it('can sort on failure rate column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const failureRateColumn = await screen.findByText('Failure rate')
      await user.click(failureRateColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.FAILURE_RATE,
            },
          })
        )
      })

      await user.click(failureRateColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.FAILURE_RATE,
            },
          })
        )
      })
    })

    it('can sort on flake rate column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const flakeRateColumn = await screen.findByText('Flake rate')
      await user.click(flakeRateColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.FLAKE_RATE,
            },
          })
        )
      })

      await user.click(flakeRateColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.FLAKE_RATE,
            },
          })
        )
      })
    })

    it('can sort on commits failed column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const commitsFailedColumn = await screen.findByText('Commits failed')
      await user.click(commitsFailedColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.COMMITS_WHERE_FAIL,
            },
          })
        )
      })

      await user.click(commitsFailedColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.COMMITS_WHERE_FAIL,
            },
          })
        )
      })
    })

    it('can sort on last run column', async () => {
      const { user, mockVariables } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const lastRunColumn = await screen.findByText('Last run')
      await user.click(lastRunColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.DESC,
              parameter: OrderingParameter.UPDATED_AT,
            },
          })
        )
      })

      await user.click(lastRunColumn)

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.UPDATED_AT,
            },
          })
        )
      })
    })
  })

  describe('infinite scrolling', () => {
    it('loads next page', async () => {
      setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const thirdCommit = await screen.findByText('test-3')
      expect(thirdCommit).toBeInTheDocument()
    })
  })

  describe('when landing on a branch page', () => {
    it('filters data by the expected branch', async () => {
      const { mockVariables } = setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(['/gh/codecov/repo/tests/main']),
      })

      await waitFor(() => {
        expect(mockVariables).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: {
              branch: 'main',
            },
          })
        )
      })
    })

    it('renders no data if no entries are returned', async () => {
      setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(['/gh/codecov/repo/tests/main']),
      })

      const content = await screen.findByText('No test results found')
      expect(content).toBeInTheDocument()
    })
  })
})
