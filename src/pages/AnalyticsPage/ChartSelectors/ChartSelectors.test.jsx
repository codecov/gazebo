import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TierNames } from 'services/tier'

import ChartSelectors from './ChartSelectors'

class ResizeObserverMock {
  constructor(cb) {
    this.cb = cb
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }])
  }
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock

const mocks = vi.hoisted(() => ({
  useIntersection: vi.fn(),
  useRepos: vi.fn(),
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

vi.mock('services/repos', async () => {
  const actual = await vi.importActual('services/repos')
  return {
    ...actual,
    useRepos: mocks.useRepos,
  }
})

const repositories = [
  {
    private: false,
    author: {
      username: 'owner1',
    },
    name: 'Repo name 1',
    latestCommitAt: subDays(new Date(), 3),
    coverage: 43,
    activated: true,
  },
  {
    private: false,
    author: {
      username: 'owner2',
    },
    name: 'Repo name 3',
    latestCommitAt: subDays(new Date(), 4),
    coverage: 35,
    activated: false,
  },
]

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
      <Route path="/analytics/:provider/:owner">
        <Suspense fallback={<p>Suspense</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
  vi.useFakeTimers().setSystemTime(new Date('2022-04-20'))
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  vi.useRealTimers()
  server.close()
})

describe('ChartSelectors', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup({ hasNextPage = false, tierValue = TierNames.PRO }) {
    // https://github.com/testing-library/user-event/issues/1034
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    const fetchNextPage = vi.fn()

    mocks.useRepos.mockReturnValue({
      data: {
        pages: [
          {
            repos: repositories,
            pageInfo: {
              hasNextPage: true,
              endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
        ],
      },
      fetchNextPage,
      hasNextPage,
    })

    server.use(
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({
          data: { owner: { plan: { tierName: tierValue } } },
        })
      })
    )

    return { fetchNextPage, user }
  }

  describe('renders component', () => {
    it('renders date picker', async () => {
      setup({})
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={vi.fn()}
        />,
        { wrapper }
      )

      const datePicker = screen.getByText('Pick a date')
      expect(datePicker).toBeInTheDocument()
    })

    it('renders multiselect', async () => {
      setup({})
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={vi.fn()}
        />,
        { wrapper }
      )

      const multiSelect = await screen.findByText('All Repos')
      expect(multiSelect).toBeInTheDocument()
    })

    it('renders clear filters', async () => {
      setup({})
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={vi.fn()}
        />,
        { wrapper }
      )

      const clearFilters = await screen.findByText('Clear filters')
      expect(clearFilters).toBeInTheDocument()
    })
  })

  describe('interacting with the date picker', () => {
    it('updates the location params', async () => {
      const updateParams = vi.fn()
      const { user } = setup({})
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={updateParams}
        />,
        { wrapper }
      )

      let datePicker = screen.getByText('Pick a date')
      await act(async () => {
        await user.click(datePicker)
      })

      const gridCells = screen.getAllByRole('gridcell', { name: '31' })
      const date = within(gridCells[0]).getByText('31')
      await act(async () => {
        await user.click(date)
      })

      await waitFor(() =>
        expect(updateParams).toHaveBeenCalledWith({
          endDate: null,
          startDate: new Date('2022-03-31T00:00:00.000Z'),
        })
      )
    })

    describe('start date and end date set and user clicks on the date', () => {
      it('clears the params', async () => {
        const updateParams = vi.fn()
        const testDate = new Date('2022-03-31T00:00:00.000Z')

        const { user } = setup({})
        render(
          <ChartSelectors
            owner="bob"
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{
              search: 'Repo name 1',
              repositories: [],
              startDate: testDate,
              endDate: testDate,
            }}
            updateParams={updateParams}
          />,
          { wrapper }
        )

        let datePicker = screen.getByText('Mar 31, 2022 - Mar 31, 2022')
        await act(async () => {
          await user.click(datePicker)
        })

        let gridCells = screen.getAllByRole('gridcell', { name: '31' })
        let date = within(gridCells[0]).getByText('31')
        await act(async () => {
          await user.click(date)
        })
      })
    })
  })

  describe('interacting with the multi select', () => {
    it('displays list of repos when opened', async () => {
      const { user } = setup({})
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={vi.fn()}
        />,
        { wrapper }
      )

      const multiselect = screen.getByText('All Repos')
      await user.click(multiselect)

      const repo1 = screen.getByText('Repo name 1')
      expect(repo1).toBeInTheDocument()

      const repo3 = screen.getByText('Repo name 3')
      expect(repo3).toBeInTheDocument()
    })

    describe('when item clicked', () => {
      it('updates button value', async () => {
        const { user } = setup({})
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: ['Repo name 1'] }}
            updateParams={vi.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('1 Repo selected')
        await user.click(multiselect)

        const repo1 = screen.getByText('Repo name 3')
        await user.click(repo1)

        const multiSelectUpdated = screen.getByText('2 Repos selected')
        expect(multiSelectUpdated).toBeInTheDocument()
      })

      it('updates url params', async () => {
        const { user } = setup({})
        const updateParams = vi.fn()
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={updateParams}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const repo1 = screen.getByText('Repo name 1')
        await user.click(repo1)

        await waitFor(() =>
          expect(updateParams).toHaveBeenCalledWith({
            repositories: ['Repo name 1'],
          })
        )
      })
    })

    describe('when searching for a repo', () => {
      it('displays the searchbox', async () => {
        const { user } = setup({})
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={vi.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const searchBox = screen.getByPlaceholderText('Search for Repos')
        expect(searchBox).toBeInTheDocument()
      })

      it('updates the textbox value when typing', async () => {
        const { user } = setup({})
        render(
          <ChartSelectors
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={vi.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const searchBox = screen.getByPlaceholderText('Search for Repos')
        await user.type(searchBox, 'codecov')

        const searchBoxUpdated = screen.getByPlaceholderText('Search for Repos')
        expect(searchBoxUpdated).toHaveAttribute('value', 'codecov')

        await waitFor(() => {
          expect(mocks.useRepos).toHaveBeenCalledWith({
            activated: true,
            first: Infinity,
            owner: 'codecov',
            provider: 'gh',
            sortItem: {
              direction: 'ASC',
              ordering: 'NAME',
            },
            suspense: false,
            term: 'codecov',
            isPublic: null,
          })
        })
      })
    })

    describe('when onLoadMore is triggered', () => {
      describe('when there is a next page', () => {
        it('calls fetchNextPage', async () => {
          mocks.useIntersection.mockReturnValue({
            isIntersecting: true,
          })
          const { user, fetchNextPage } = setup({ hasNextPage: true })

          render(
            <ChartSelectors
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={vi.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          await waitFor(() => expect(fetchNextPage).toHaveBeenCalled())
        })
      })

      describe('when there is no next page', () => {
        it('does not calls fetchNextPage', async () => {
          const { user, fetchNextPage } = setup({ hasNextPage: false })

          render(
            <ChartSelectors
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={vi.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          expect(fetchNextPage).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('interacting with clear filters', () => {
    it('updates params', async () => {
      const { user } = setup({})
      const updateParams = vi.fn()
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={updateParams}
        />,
        { wrapper }
      )

      const clearFilters = screen.getByRole('button', {
        name: 'Clear filters',
      })
      await user.click(clearFilters)

      await waitFor(() =>
        expect(updateParams).toHaveBeenCalledWith({
          endDate: null,
          repositories: [],
          startDate: null,
        })
      )
    })
  })

  describe('owner is on a team plan', () => {
    it('renders upgrade cta', async () => {
      setup({ hasNextPage: false, tierValue: TierNames.TEAM })
      render(
        <ChartSelectors
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={vi.fn()}
        />,
        { wrapper }
      )

      const ctaMsg = await screen.findByText(/Public repos only/)
      expect(ctaMsg).toBeInTheDocument()

      const upgradeLink = await screen.findByRole('link', { name: 'Upgrade' })
      expect(upgradeLink).toBeInTheDocument()
      expect(upgradeLink).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
      await waitFor(() => {
        expect(mocks.useRepos).toHaveBeenCalledWith({
          activated: true,
          first: Infinity,
          owner: 'codecov',
          provider: 'gh',
          sortItem: {
            direction: 'ASC',
            ordering: 'NAME',
          },
          suspense: false,
          term: '',
          isPublic: true,
        })
      })
    })
  })
})
