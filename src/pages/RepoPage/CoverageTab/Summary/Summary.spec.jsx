import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useCoverageRedirect } from './hooks/useCoverageRedirect'
import Summary from './Summary'

jest.mock('./hooks/useCoverageRedirect')
jest.mock('./CoverageTrend', () => () => 'CoverageTrend')
jest.mock('react-use/lib/useIntersection')

const mockRepoOverview = {
  private: false,
  defaultBranch: 'main',
}

const mockBranches = {
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockRepoCoverage = {
  branch: {
    name: 'main',
    head: {
      totals: {
        percentCovered: 95.0,
        lineCount: 100,
        hitsCount: 100,
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test/critical-role']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
      {/* 
    Route to render the current location to reduce complexity to track
    the current location
  */}
      <Route
        path="*"
        render={({ location }) => {
          return location.pathname
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('Summary', () => {
  const mockOnChange = jest.fn()
  const mockSetNewPath = jest.fn()
  const mockUseCoverageRedirectData = {
    redirectState: {
      isRedirectionEnabled: false,
      newPath: undefined,
    },
    setNewPath: mockSetNewPath,
  }

  function setup() {
    useCoverageRedirect.mockReturnValue(mockUseCoverageRedirectData)
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockBranches } })
        )
      }),
      graphql.query('GetRepoCoverage', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoCoverage } })
        )
      )
    )
  }

  describe.only('with populated data', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the branch selector', async () => {
      render(<Summary />, { wrapper })

      const branchContext = await screen.findByText(/Branch Context/)
      expect(branchContext).toBeInTheDocument()
    })

    it.only('renders default branch as selected branch', async () => {
      render(<Summary />, { wrapper })

      const dropDownBtn = await screen.findByText('main')
      expect(dropDownBtn).toBeInTheDocument()
    })

    it('renders the source commit short sha', async () => {
      render(<Summary />, { wrapper })

      const shortSha = await screen.findByText(/321fdsa/)
      expect(shortSha).toBeInTheDocument()
    })
  })

  describe('before data has resolved', () => {
    beforeEach(() => {
      setup({
        useCoverageRedirectData: mockUseCoverageRedirectData,
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [{}],
            onChange: mockOnChange,
            value: {},
          },
          currentBranchSelected: undefined,
          defaultBranch: 'main',
          privateRepo: false,
          coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
          coverageChange: 40,
          legacyApiIsSuccess: true,
        },
      })
    })

    it('renders the branch selector', () => {
      render(<Summary />, { wrapper })

      expect(screen.getByText(/Branch Context/)).toBeInTheDocument()
    })

    it('if no branch selected do not render the sha', () => {
      render(<Summary />, { wrapper })

      expect(screen.queryByText(/abs890d/)).not.toBeInTheDocument()
    })
  })

  describe('branch coverage', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: mockUseCoverageRedirectData,
        useSummaryData: {
          isLoading: false,
          data: {
            head: {
              totals: { percentCovered: 60.4, hitsCount: 54, lineCount: 753 },
            },
          },
          branchSelectorProps: {
            items: [{ name: 'critical-role' }, selectedBranch],
            onChange: mockOnChange,
            value: {
              name: 'something-else',
              head: {
                commitid: 'abs890dasf809',
              },
            },
          },
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
          coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
          coverageChange: 40,
          legacyApiIsSuccess: true,
        },
      })
    })

    it('renders the branch coverage', () => {
      render(<Summary />, { wrapper })

      expect(screen.getByText('60.40%')).toBeInTheDocument()
    })
    it('renders the lines covered', () => {
      render(<Summary />, { wrapper })

      expect(screen.getByText('54 of 753 lines covered')).toBeInTheDocument()
    })
  })
  /*
    I don't love this test but I couldn't think of a good way to test
    the select user interaction and the location change correctly.
  */
  describe('uses a conditional Redirect', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: {
          redirectState: {
            newPath: '/some/new/location',
            isRedirectionEnabled: true,
          },
          setNewPath: mockSetNewPath,
        },
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [selectedBranch],
            onChange: mockOnChange,
            value: selectedBranch,
          },
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
          coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
          coverageChange: 40,
          legacyApiIsSuccess: true,
        },
      })
    })

    it('updates the location', () => {
      render(<Summary />, { wrapper })

      expect(screen.getByText(/some\/new\/location/)).toBeInTheDocument()
    })
  })

  describe('fires the setNewPath on branch selection', () => {
    beforeEach(() => {
      const selectedBranch = {
        name: 'something-else',
        head: {
          commitid: 'abs890dasf809',
        },
      }

      setup({
        useCoverageRedirectData: {
          redirectState: {
            newPath: '/some/new/location',
            isRedirectionEnabled: true,
          },
          setNewPath: mockSetNewPath,
        },
        useSummaryData: {
          isLoading: false,
          data: {},
          branchSelectorProps: {
            items: [
              { name: 'foo', head: { commitid: '1234' } },
              selectedBranch,
            ],
            onChange: mockOnChange,
            value: selectedBranch,
          },
          currentBranchSelected: selectedBranch,
          defaultBranch: 'main',
          privateRepo: false,
          coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
          coverageChange: 40,
          legacyApiIsSuccess: true,
        },
      })
    })

    it('updates the location', () => {
      render(<Summary />, { wrapper })

      // open select
      userEvent.click(screen.getByRole('button', { name: /select branch/i }))
      // pick foo branch
      userEvent.click(screen.getByRole('option', { name: /foo/ }))

      expect(mockSetNewPath).toHaveBeenCalled()
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('there is a next page', () => {
      const fetchNextPage = jest.fn()
      beforeEach(() => {
        const selectedBranch = {
          name: 'something-else',
          head: {
            commitid: 'abs890dasf809',
          },
        }

        setup({
          useCoverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
          useSummaryData: {
            isLoading: false,
            data: {},
            branchSelectorProps: {
              items: [
                { name: 'foo', head: { commitid: '1234' } },
                selectedBranch,
              ],
              onChange: mockOnChange,
              value: selectedBranch,
            },
            currentBranchSelected: selectedBranch,
            defaultBranch: 'main',
            privateRepo: false,
            coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
            coverageChange: 40,
            legacyApiIsSuccess: true,
            branchesFetchNextPage: fetchNextPage,
            branchesHasNextPage: true,
          },
        })

        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      it('calls fetchNextPage', async () => {
        render(<Summary />, { wrapper })

        const select = screen.getByRole('button', { name: 'select branch' })
        userEvent.click(select)

        await waitFor(() => expect(fetchNextPage).toBeCalled())
      })
    })

    describe('when there is not a next page', () => {
      const fetchNextPage = jest.fn()
      beforeEach(() => {
        const selectedBranch = {
          name: 'something-else',
          head: {
            commitid: 'abs890dasf809',
          },
        }

        setup({
          useCoverageRedirectData: {
            redirectState: {
              newPath: '/some/new/location',
              isRedirectionEnabled: true,
            },
            setNewPath: mockSetNewPath,
          },
          useSummaryData: {
            isLoading: false,
            data: {},
            branchSelectorProps: {
              items: [
                { name: 'foo', head: { commitid: '1234' } },
                selectedBranch,
              ],
              onChange: mockOnChange,
              value: selectedBranch,
            },
            currentBranchSelected: selectedBranch,
            defaultBranch: 'main',
            privateRepo: false,
            coverage: [{ coverage: 40 }, { coverage: 50 }, { coverage: 30 }],
            coverageChange: 40,
            legacyApiIsSuccess: true,
            branchesFetchNextPage: fetchNextPage,
            branchesHasNextPage: false,
            branchList: [{ name: 'foo', head: { commitid: '1234' } }],
            branchListIsFetching: false,
            branchListHasNextPage: false,
            branchListFetchNextPage: fetchNextPage,
            setBranchSearchTerm: () => {},
          },
        })

        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })
      it('does not call fetchNextPage', async () => {
        render(<Summary />, { wrapper })

        const select = screen.getByRole('button', { name: 'select branch' })
        userEvent.click(select)

        await waitFor(() => expect(fetchNextPage).not.toBeCalled())
      })
    })
  })
})
