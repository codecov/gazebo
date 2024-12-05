import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

vi.mock('./BranchSelector', () => ({ default: () => 'BranchSelector' }))

const server = setupServer()
const queryClient = new QueryClient()
const testLocation = {
  pathname: '',
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: true,
        componentsCount: 99,
      },
    },
  },
}

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsYaml: [
          {
            id: 'component1',
            name: 'Component 1',
          },
          {
            id: 'component2',
            name: 'Component 2',
          },
        ],
      },
    },
  },
}

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    const user = userEvent.setup()
    const mockApiVars = vi.fn()

    server.use(
      graphql.query('BackfillComponentMemberships', () => {
        return HttpResponse.json({ data: backfillData })
      }),
      graphql.query('RepoComponentsSelector', (info) => {
        mockApiVars(info.variables)

        return HttpResponse.json({ data: mockResponse })
      })
    )

    return { user, mockApiVars }
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

      it('Renders the label', async () => {
        render(<Header />, { wrapper })

        const historicalTrend = await screen.findByText(/Historical trend/)
        expect(historicalTrend).toBeInTheDocument()
      })
    })

    describe('BranchSelector', () => {
      beforeEach(() => setup())

      it('Renders the BranchSelector', async () => {
        render(<Header />, { wrapper })

        const branchSelector = await screen.findByText('BranchSelector')
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

        expect(await screen.findByText('Last 6 months')).toBeVisible()
      })

      it('updates the location params on select', async () => {
        const { user } = setup()
        render(<Header />, { wrapper })

        const historicalTrend = screen.getByRole('button', {
          name: 'Select Historical Trend',
        })
        await user.click(historicalTrend)

        const item = await screen.findByText('Last 7 days')
        await user.click(item)

        await waitFor(() => {
          expect(testLocation.pathname).toBe('/gh/codecov/gazebo/components')
        })
      })
    })
  })

  describe('Show by', () => {
    describe('Title', () => {
      beforeEach(() => setup())

      it('renders the label', async () => {
        render(<Header />, { wrapper })

        const showBy = await screen.findByText('Show by')
        expect(showBy).toBeInTheDocument()
      })
    })

    describe('MultiSelect', () => {
      describe('on page load', () => {
        it('loads the expected list', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = await screen.findByText('All Components')
          await user.click(button)

          const component1 = await screen.findByText('component1')
          expect(component1).toBeInTheDocument()
        })

        it('updates the location params on select', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = await screen.findByText('All Components')
          await user.click(button)

          const component1 = await screen.findByText('component1')
          await user.click(component1)

          await waitFor(() => {
            expect(testLocation.pathname).toBe('/gh/codecov/gazebo/components')
          })
        })
      })

      describe('when searching for a component', () => {
        it('displays the search box', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = await screen.findByText('All Components')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Components')
          expect(searchBox).toBeInTheDocument()
        })

        it('updates the textbox value when typing', async () => {
          const { user } = setup()
          render(<Header />, { wrapper })

          const button = await screen.findByText('All Components')
          await user.click(button)

          const searchBox = screen.getByPlaceholderText('Search for Components')
          await user.type(searchBox, 'component2')

          const searchBoxUpdated = screen.getByPlaceholderText(
            'Search for Components'
          )
          expect(searchBoxUpdated).toHaveAttribute('value', 'component2')
        })

        it('calls useRepoComponentssSelect with term', async () => {
          const { user, mockApiVars } = setup()
          render(<Header />, { wrapper })

          const button = await screen.findByText('All Components')
          await user.click(button)

          const searchBox = await screen.findByPlaceholderText(
            'Search for Components'
          )
          await user.type(searchBox, 'component2')

          await waitFor(() =>
            expect(mockApiVars).toHaveBeenLastCalledWith({
              owner: 'codecov',
              repo: 'gazebo',
              termId: 'component2',
            })
          )
        })
      })
    })
  })
})
