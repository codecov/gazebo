import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
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
}))

vi.mock('react-use', async () => {
  const actual = await vi.importActual('react-use')
  return {
    ...actual,
    useIntersection: mocks.useIntersection,
  }
})

const repositories = [
  {
    name: 'Repo name 1',
    active: true,
    activated: true,
    coverageAnalytics: {
      lines: 99,
      percentCovered: null,
    },
    private: false,
    updatedAt: '2021-04-22T14:09:39.822872+00:00',
    author: {
      username: 'owner1',
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
    latestCommitAt: null,
    coverageEnabled: true,
    bundleAnalysisEnabled: true,
  },
  {
    name: 'Repo name 3',
    active: false,
    activated: true,
    coverageAnalytics: {
      lines: 99,
      percentCovered: null,
    },
    private: false,
    updatedAt: '2021-04-22T14:09:39.826948+00:00',
    author: {
      username: 'owner2',
    },
    repositoryConfig: {
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
    },
    latestCommitAt: null,
    coverageEnabled: true,
    bundleAnalysisEnabled: true,
  },
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
        <Route path="/analytics/:provider/:owner">
          <Suspense fallback={<p>Suspense</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
  vi.useFakeTimers().setSystemTime(new Date('2022-04-20'))
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
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
    const searchTerm = vi.fn()

    server.use(
      graphql.query('OwnerTier', () => {
        return HttpResponse.json({
          data: { owner: { plan: { tierName: tierValue } } },
        })
      }),
      graphql.query('ReposForOwner', ({ variables }) => {
        if (variables?.filters?.term) {
          searchTerm(variables.filters.term)
        }

        if (variables?.after) {
          fetchNextPage()
        }

        return HttpResponse.json({
          data: {
            owner: {
              username: 'owner',
              repositories: {
                edges: [{ node: repositories[0] }, { node: repositories[1] }],
                pageInfo: {
                  hasNextPage,
                  endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        })
      })
    )

    return { fetchNextPage, user, searchTerm }
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

      const datePicker = await screen.findByText('Pick a date')
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

      let datePicker = await screen.findByText('Pick a date')
      await act(async () => {
        await user.click(datePicker)
      })

      const gridCells = await screen.findAllByRole('gridcell', { name: '31' })
      const date = await within(gridCells[0]).findByText('31')
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

        let datePicker = await screen.findByText('Mar 31, 2022 - Mar 31, 2022')
        await act(async () => {
          await user.click(datePicker)
        })

        let gridCells = await screen.findAllByRole('gridcell', { name: '31' })
        let date = await within(gridCells[0]).findByText('31')
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

      const multiselect = await screen.findByText('All Repos')
      await user.click(multiselect)

      const repo1 = await screen.findByText('Repo name 1')
      expect(repo1).toBeInTheDocument()

      const repo3 = await screen.findByText('Repo name 3')
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

        const multiselect = await screen.findByText('1 Repo selected')
        await user.click(multiselect)

        const repo1 = await screen.findByText('Repo name 3')
        await user.click(repo1)

        const multiSelectUpdated = await screen.findByText('2 Repos selected')
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

        const multiselect = await screen.findByText('All Repos')
        await user.click(multiselect)

        const repo1 = await screen.findByText('Repo name 1')
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

        const multiselect = await screen.findByText('All Repos')
        await user.click(multiselect)

        const searchBox = await screen.findByPlaceholderText('Search for Repos')
        expect(searchBox).toBeInTheDocument()
      })

      it('updates the textbox value when typing', async () => {
        const { user, searchTerm } = setup({})
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

        const multiselect = await screen.findByText('All Repos')
        await user.click(multiselect)

        const searchBox = await screen.findByPlaceholderText('Search for Repos')
        await user.type(searchBox, 'codecov')

        const searchBoxUpdated =
          await screen.findByPlaceholderText('Search for Repos')
        expect(searchBoxUpdated).toHaveAttribute('value', 'codecov')

        await waitFor(() => {
          expect(searchTerm).toHaveBeenCalledWith('codecov')
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

          const multiselect = await screen.findByText('All Repos')
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

          const multiselect = await screen.findByText('All Repos')
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

      const clearFilters = await screen.findByRole('button', {
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
    })
  })
})
