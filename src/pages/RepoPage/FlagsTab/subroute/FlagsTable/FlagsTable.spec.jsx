import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
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
    isAdmin: true,
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

const mockNoReportsUploadedMeasurements = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag1',
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
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation
const wrapper =
  (initialEntries = '/gh/codecov/gazebo/flags') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/flags">
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('RepoContentsTable', () => {
  function setup(
    { noData, noReportsUploaded } = { noData: false, noReportsUploaded: false }
  ) {
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

        if (noReportsUploaded) {
          return res(
            ctx.status(200),
            ctx.data(mockNoReportsUploadedMeasurements)
          )
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

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const flags = screen.getByText('Flags')
      expect(flags).toBeInTheDocument()

      const coverage = screen.getByText('Coverage %')
      expect(coverage).toBeInTheDocument()

      const trend = screen.getByText('Trend')
      expect(trend).toBeInTheDocument()
    })

    it('renders repo flags', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const flag1 = await screen.findByRole('link', { name: 'flag1' })
      expect(flag1).toBeInTheDocument()
      expect(flag1).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flag1'
      )

      const flag2 = await screen.findByRole('link', { name: 'flag2' })
      expect(flag2).toBeInTheDocument()
      expect(flag2).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flag2'
      )
    })

    it('renders flags coverage', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const ninetyThreePercent = screen.getByText(/93.26%/)
      expect(ninetyThreePercent).toBeInTheDocument()

      const ninetyOnePercent = screen.getByText(/91.74%/)
      expect(ninetyOnePercent).toBeInTheDocument()
    })

    it('renders flags sparkline with change', async () => {
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const flag1SparkLine = screen.getByText(/Flag flag1 trend sparkline/)
      expect(flag1SparkLine).toBeInTheDocument()

      const minusOne = screen.getByText(/-1.56/)
      expect(minusOne).toBeInTheDocument()

      const flag2SparkLine = screen.getByText(/Flag flag2 trend sparkline/)
      expect(flag2SparkLine).toBeInTheDocument()

      const noData = screen.getByText('No Data')
      expect(noData).toBeInTheDocument()
    })
  })

  describe('flag name is clicked', () => {
    it('goes to coverage page', async () => {
      const { user } = setup()

      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const flag1 = screen.getByRole('link', { name: 'flag1' })
      expect(flag1).toBeInTheDocument()
      expect(flag1).toHaveAttribute(
        'href',
        '/gh/codecov/gazebo?flags%5B0%5D=flag1'
      )

      user.click(flag1)
      expect(testLocation.pathname).toBe('/gh/codecov/gazebo/flags')
    })
  })

  describe('when the delete icon is clicked', () => {
    it('calls functions to open modal', async () => {
      const { user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const trashIconButtons = screen.getAllByRole('button', {
        name: /trash/,
      })
      expect(trashIconButtons).toHaveLength(2)

      const [firstIcon] = trashIconButtons
      await act(async () => {
        await user.click(firstIcon)
      })

      const deleteFlagModalText = screen.getByText('Delete Flag')
      expect(deleteFlagModalText).toBeInTheDocument()

      const cancelButton = screen.getByRole('button', {
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

        await expect(
          screen.findByTestId('spinner')
        ).resolves.toBeInTheDocument()
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const errorMessage = screen.getByText(
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

        await expect(
          screen.findByTestId('spinner')
        ).resolves.toBeInTheDocument()
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const noResultsFound = screen.getByText(/No results found/)
        expect(noResultsFound).toBeInTheDocument()
      })
    })
  })

  describe('when hasNextPage is true', () => {
    it('renders load more button', async () => {
      setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const loadMore = screen.getByText('Load More')
      expect(loadMore).toBeInTheDocument()
    })

    it('fires next page button click', async () => {
      const { fetchNextPage, user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const loadMore = screen.getByText('Load More')

      await user.click(loadMore)

      await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
    })
  })

  describe('when sorting', () => {
    it('calls handleSort', async () => {
      const { handleSort, user } = setup()
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const flags = screen.getByText('Flags')

      await user.click(flags)
      await waitFor(() => expect(handleSort).toHaveBeenLastCalledWith('DESC'))

      await user.click(flags)
      await waitFor(() => expect(handleSort).toHaveBeenLastCalledWith('ASC'))
    })
  })

  describe('when no coverage report uploaded', () => {
    it('renders no report data state', async () => {
      setup({ noReportsUploaded: true })
      render(<FlagsTable />, { wrapper: wrapper() })

      await expect(screen.findByTestId('spinner')).resolves.toBeInTheDocument()
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
      const dash = await screen.findByText('-')
      expect(dash).toBeInTheDocument()
    })
  })
})
