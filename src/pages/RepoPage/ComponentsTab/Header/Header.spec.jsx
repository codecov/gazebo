import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useLocationParams } from 'services/navigation'

import Header from './Header'

jest.mock('react-use/lib/useIntersection')
jest.mock('services/navigation/useLocationParams')
jest.mock('./BranchSelector', () => () => 'BranchSelector')

const server = setupServer()
const queryClient = new QueryClient()
let testLocation = {
  pathname: '',
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/components']}>
      <Route path="/:provider/:owner/:repo/components" exact={true}>
        {children}
      </Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation.pathname = location.pathname
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const backfillData = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      flagsMeasurementsActive: true,
      flagsMeasurementsBackfilled: true,
      flagsCount: 99,
    },
  },
}

const mockFirstResponse = {
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
          endCursor: '1-flag-1',
        },
      },
    },
  },
}

const mockSecondResponse = {
  owner: {
    repository: {
      flags: {
        edges: [
          {
            node: {
              name: 'flag2',
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

describe('Header', () => {
  afterEach(() => jest.resetAllMocks())

  function setup(
    { noNextPage = false } = {
      noNextPage: false,
    }
  ) {
    const user = userEvent.setup()
    const updateLocationMock = jest.fn()
    const mockApiVars = jest.fn()

    useLocationParams.mockReturnValue({
      params: { search: '', historicalTrend: '', flags: [] },
      updateParams: updateLocationMock,
    })

    server.use(
      graphql.query('BackfillFlagMemberships', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(backfillData))
      ),
      graphql.query('FlagsSelect', (req, res, ctx) => {
        mockApiVars(req.variables)

        if (!!req.variables?.after || noNextPage) {
          return res(ctx.status(200), ctx.data(mockSecondResponse))
        }

        return res(ctx.status(200), ctx.data(mockFirstResponse))
      })
    )

    return { user, updateLocationMock, mockApiVars }
  }

  describe('Configured Components', () => {
    beforeEach(() => setup())

    it('Renders the label', async () => {
      render(<Header />, { wrapper })

      const page = await screen.findByText(/Configured components/)
      expect(page).toBeInTheDocument()
    })
    it('Renders the correct number of components on the repo', async () => {
      render(<Header />, { wrapper })

      const page = await screen.findByText(/99/)
      expect(page).toBeInTheDocument()
    })
  })

  describe('Historical Trend', () => {
    describe('Title', () => {
      beforeEach(() => setup())

      it('Renders the label', () => {
        render(<Header />, { wrapper })

        expect(screen.getByText(/Historical trend/)).toBeInTheDocument()
      })
    })

    describe('BranchSelector', () => {
      beforeEach(() => setup())

      it('Renders the BranchSelector', () => {
        render(<Header />, { wrapper })

        const branchSelector = screen.getByText('BranchSelector')
        expect(branchSelector).toBeInTheDocument()
      })
    })

    describe('Select', () => {
      beforeEach(() => setup())

      it('loads the expected list', async () => {
        const { user } = setup()
        render(<Header />, { wrapper })

        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        await user.click(historicalTrend)

        expect(screen.getByText('Last 6 months')).toBeVisible()
      })

      it('updates the location params on select', async () => {
        const { user, updateLocationMock } = setup()
        render(<Header />, { wrapper })

        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        await user.click(historicalTrend)

        const item = screen.getByText('Last 7 days')
        await user.click(item)

        expect(updateLocationMock).toHaveBeenCalledWith({
          historicalTrend: 'LAST_7_DAYS',
        })
      })
    })
  })

  describe('Show by', () => {
    describe('Title', () => {
      beforeEach(() => setup())

      it('renders the label', () => {
        render(<Header />, { wrapper })

        const showBy = screen.getByText('Show by')
        expect(showBy).toBeInTheDocument()
      })
    })

    describe('MultiSelect', () => {
      describe('on page load', () => {
        it('loads the expected list', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All components')
          await user.click(button)

          const flag1 = screen.getByText('flag1')
          expect(flag1).toBeInTheDocument()
        })

        it('updates the location params on select', async () => {
          const { user, updateLocationMock } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All components')
          await user.click(button)

          const flag1 = screen.getByText('flag1')
          await user.click(flag1)

          expect(updateLocationMock).toHaveBeenCalledWith({
            flags: ['flag1'],
          })
        })
      })

      describe('where onLoadMore is triggered', () => {
        describe('when there is a next page', () => {
          it('calls fetchNextPage', async () => {
            const { user } = setup()
            useIntersection.mockReturnValue({ isIntersecting: true })

            render(<Header />, { wrapper })

            const button = screen.getByText('All components')
            await user.click(button)

            const flag1 = await screen.findByText('flag1')
            expect(flag1).toBeInTheDocument()

            const flag2 = await screen.findByText('flag2')
            expect(flag2).toBeInTheDocument()
          })
        })

        describe('when there is no next page', () => {
          it('does not calls fetchNextPage', async () => {
            const { user } = setup(true)
            useIntersection.mockReturnValue({ isIntersecting: true })

            render(<Header />, { wrapper })

            const button = screen.getByText('All components')
            await user.click(button)

            const flag2 = await screen.findByText('flag2')
            expect(flag2).toBeInTheDocument()
          })
        })
      })

      describe('when searching for a component', () => {
        it('displays the search box', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All components')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Components')
          expect(searchBox).toBeInTheDocument()
        })

        it('updates the textbox value when typing', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All components')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Components')
          await user.type(searchBox, 'flag2')

          const searchBoxUpdated = screen.getByPlaceholderText(
            'Search for Components'
          )
          expect(searchBoxUpdated).toHaveAttribute('value', 'flag2')
        })

        it('calls useRepoFlagsSelect with term', async () => {
          const { user, mockApiVars } = setup()
          render(<Header />, { wrapper })

          const button = screen.getByText('All components')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Components')
          await user.type(searchBox, 'flag2')

          await waitFor(() =>
            expect(mockApiVars).toHaveBeenCalledWith({
              name: 'codecov',
              repo: 'gazebo',
              filters: { term: 'flag2' },
            })
          )
        })
      })
    })
  })
})
