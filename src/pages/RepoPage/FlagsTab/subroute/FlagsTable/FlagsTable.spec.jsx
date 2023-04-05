import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import FlagsTable from './FlagsTable'

const mockRepoConfig = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: { upperRange: 80, lowerRange: 60 },
      },
    },
  },
}

const mockGetRepo = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      private: false,
      uploadToken: 'token',
      defaultBranch: 'main',
      yaml: '',
      activated: true,
      oldestCommitAt: '2020-01-01T12:00:00',
    },
  },
}

const mockFlagMeasurements = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag1',
              percentCovered: 93.26,
              percentChange: -1.56,
              measurements: [{ avg: 51.78 }, { avg: 93.356 }],
            },
          },
          {
            node: {
              name: 'flag2',
              percentCovered: 91.74,
              percentChange: null,
              measurements: [{ avg: null }, { avg: null }],
            },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'end-cursor',
        },
      },
    },
  },
}

const mockEmptyFlagMeasurements = {
  owner: {
    repository: {
      flags: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/gazebo/flags') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/flags">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('RepoContentsTable', () => {
  function setup({ noData } = { noData: false }) {
    const user = userEvent.setup()
    const fetchNextPage = jest.fn()
    const handleSort = jest.fn()

    server.use(
      graphql.query('FlagMeasurements', (req, res, ctx) => {
        handleSort(req?.variables?.orderingDirection)

        if (req?.variables?.after) {
          fetchNextPage(req?.variables?.after)
        }

        if (noData) {
          return res(ctx.status(200), ctx.data(mockEmptyFlagMeasurements))
        }

        return res(ctx.status(200), ctx.data(mockFlagMeasurements))
      }),
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockGetRepo))
      }),
      graphql.query('RepoConfig', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockRepoConfig))
      )
    )

    return { fetchNextPage, handleSort, user }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders table headers', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const flags = await screen.findByText('Flags')
      expect(flags).toBeInTheDocument()

      const coverage = await screen.findByText('Coverage %')
      expect(coverage).toBeInTheDocument()

      const trend = await screen.findByText('Trend')
      expect(trend).toBeInTheDocument()
    })

    it('renders repo flags', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const flag1 = await screen.findByText('flag1')
      expect(flag1).toBeInTheDocument()

      const flag2 = await screen.findByText('flag2')
      expect(flag2).toBeInTheDocument()
    })

    it('renders flags coverage', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const ninetyThreePercent = await screen.findByText(/93.26%/)
      expect(ninetyThreePercent).toBeInTheDocument()

      const ninetyOnePercent = await screen.findByText(/91.74%/)
      expect(ninetyOnePercent).toBeInTheDocument()
    })

    it('renders flags sparkline with change', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      const flag1SparkLine = await screen.findByText(
        /Flag flag1 trend sparkline/
      )
      expect(flag1SparkLine).toBeInTheDocument()

      const minusOne = await screen.findByText(/-1.56/)
      expect(minusOne).toBeInTheDocument()

      const flag2SparkLine = await screen.findByText(
        /Flag flag2 trend sparkline/
      )
      expect(flag2SparkLine).toBeInTheDocument()

      const noData = await screen.findByText('No Data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when the delete icon is clicked', () => {
    it('calls functions to open modal', async () => {
      const { user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })
      const trashIconButtons = await screen.findAllByRole('button', {
        name: /trash/,
      })
      expect(trashIconButtons).toHaveLength(2)

      await user.click(trashIconButtons[0])

      const deleteFlagModalText = await screen.findByText('Delete Flag')
      expect(deleteFlagModalText).toBeInTheDocument()

      const cancelButton = await screen.findByRole('button', {
        name: /Cancel/,
      })
      await user.click(cancelButton)
      await waitFor(() => expect(deleteFlagModalText).not.toBeInTheDocument())
    })
  })

  describe('when no data is returned', () => {
    describe('isSearching is false', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<FlagsTable />, { wrapper: wrapper() })

        const errorMessage = await screen.findByText(
          /There was a problem getting flags data/
        )
        expect(errorMessage).toBeInTheDocument()
      })
    })

    describe('isSearching is true', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('renders expected empty state message', async () => {
        render(<FlagsTable />, {
          wrapper: wrapper('/gh/codecov/gazebo/flags?search=blah'),
        })

        const noResultsFound = await screen.findByText(/No results found/)
        expect(noResultsFound).toBeInTheDocument()
      })
    })
  })

  describe('when hasNextPage is true', () => {
    it('renders load more button', async () => {
      setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      const loadMore = await screen.findByText('Load More')
      expect(loadMore).toBeInTheDocument()
    })

    it('fires next page button click', async () => {
      const { fetchNextPage, user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      const loadMore = await screen.findByText('Load More')

      await user.click(loadMore)

      await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
    })
  })

  describe('when sorting', () => {
    it('calls handleSort', async () => {
      const { handleSort, user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      const flags = await screen.findByText('Flags')

      await user.click(flags)
      await waitFor(() => expect(handleSort).toHaveBeenLastCalledWith('DESC'))

      await user.click(flags)
      await waitFor(() => expect(handleSort).toHaveBeenLastCalledWith('ASC'))
    })
  })
})
