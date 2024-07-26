import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import FailedTestsTable from './FailedTestsTable'

import { OrderingDirection, OrderingParameter } from '../hooks'

const node1 = {
  updatedAt: '2023-01-01T00:00:00Z',
  name: 'test-1',
  commitsFailed: 1,
  failureRate: 0.1,
  avgDuration: 10,
}

const node2 = {
  updatedAt: '2023-01-02T00:00:00Z',
  name: 'test-2',
  commitsFailed: 2,
  failureRate: 0.2,
  avgDuration: 20,
}

const node3 = {
  updatedAt: '2023-01-03T00:00:00Z',
  name: 'test-3',
  commitsFailed: 3,
  failureRate: 0.3,
  avgDuration: 30,
}

const server = setupServer()
const wrapper =
  (queryClient: QueryClient): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh/codecov/cool-repo/tests']}>
          <Route path="/:provider/:owner/:repo/tests">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

let consoleError: any
let consoleWarn: any

beforeEach(() => {
  // Mock console.error and console.warn
  consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  // Restore console methods
  consoleError.mockRestore()
  consoleWarn.mockRestore()
})

interface SetupArgs {
  noEntries?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('FailedTestsTable', () => {
  function setup({ noEntries = false }: SetupArgs) {
    const queryClient = new QueryClient()

    const user = userEvent.setup()
    const mockSort = jest.fn()

    server.use(
      graphql.query('GetTestResults', (req, res, ctx) => {
        mockSort(req.variables)
        if (noEntries) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                repository: {
                  __typename: 'Repository',
                  testResults: {
                    edges: [],
                    pageInfo: {
                      hasNextPage: false,
                      endCursor: null,
                    },
                  },
                },
              },
            })
          )
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              testResults: {
                edges: req.variables.after
                  ? [
                      {
                        node: node3,
                      },
                    ]
                  : [
                      {
                        node: node1,
                      },
                      {
                        node: node2,
                      },
                    ],
                pageInfo: {
                  hasNextPage: req.variables.after ? false : true,
                  endCursor: req.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    return { queryClient, user, mockSort }
  }

  describe('renders table headers', () => {
    it('renders each column name', async () => {
      const { queryClient } = setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const nameColumn = await screen.findByText('Test name')
      expect(nameColumn).toBeInTheDocument()

      const durationColumn = await screen.findByText('Average duration')
      expect(durationColumn).toBeInTheDocument()

      const failureRateColumn = await screen.findByText('Failure rate')
      expect(failureRateColumn).toBeInTheDocument()

      const commitFailedColumn = await screen.findByText('Commits failed')
      expect(commitFailedColumn).toBeInTheDocument()

      const lastRunColumn = await screen.findByText('Last run')
      expect(lastRunColumn).toBeInTheDocument()
    })
  })

  describe('renders table body', () => {
    it('renders the first element', async () => {
      const { queryClient } = setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, false)

      const nameColumn = await screen.findByText('test-1')
      expect(nameColumn).toBeInTheDocument()

      const durationColumn = await screen.findByText('10.000s')
      expect(durationColumn).toBeInTheDocument()

      const failureRateColumn = await screen.findByText('10.00%')
      expect(failureRateColumn).toBeInTheDocument()

      const commitFailedColumn = await screen.findByText('1')
      expect(commitFailedColumn).toBeInTheDocument()

      const lastRunColumn = await screen.findAllByText('over 1 year ago')
      expect(lastRunColumn.length).toBeGreaterThan(0)
    })
  })

  describe('no data is returned', () => {
    it('still returns an empty table', async () => {
      const { queryClient } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      expect(consoleError).not.toHaveBeenCalled()
      expect(consoleWarn).not.toHaveBeenCalled()
    })
  })

  describe('ability to sort', () => {
    it('can sort on duration column', async () => {
      const { queryClient, user, mockSort } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const durationColumn = await screen.findByText('Average duration')
      await user.click(durationColumn)

      await waitFor(() => {
        expect(mockSort).toHaveBeenCalledWith(
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
        expect(mockSort).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.AVG_DURATION,
            },
          })
        )
      })
    })

    it('can sort on failure rate column', async () => {
      const { queryClient, user, mockSort } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const failureRateColumn = await screen.findByText('Failure rate')
      await user.click(failureRateColumn)

      await waitFor(() => {
        expect(mockSort).toHaveBeenCalledWith(
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
        expect(mockSort).toHaveBeenCalledWith(
          expect.objectContaining({
            ordering: {
              direction: OrderingDirection.ASC,
              parameter: OrderingParameter.FAILURE_RATE,
            },
          })
        )
      })
    })

    it('can sort on commits failed column', async () => {
      const { queryClient, user, mockSort } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const commitsFailedColumn = await screen.findByText('Commits failed')
      await user.click(commitsFailedColumn)

      await waitFor(() => {
        expect(mockSort).toHaveBeenCalledWith(
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
        expect(mockSort).toHaveBeenCalledWith(
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
      const { queryClient, user, mockSort } = setup({ noEntries: true })
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const lastRunColumn = await screen.findByText('Last run')
      await user.click(lastRunColumn)

      await waitFor(() => {
        expect(mockSort).toHaveBeenCalledWith(
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
        expect(mockSort).toHaveBeenCalledWith(
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
      const { queryClient } = setup({})
      render(<FailedTestsTable />, {
        wrapper: wrapper(queryClient),
      })

      const loading = await screen.findByText('Loading')
      mockIsIntersecting(loading, true)
      await waitForElementToBeRemoved(loading)

      const thirdCommit = await screen.findByText('test-3')
      expect(thirdCommit).toBeInTheDocument()
    })
  })
})
