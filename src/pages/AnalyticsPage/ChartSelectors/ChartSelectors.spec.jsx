import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useRepos } from 'services/repos'

import ChartSelectors from './ChartSelectors'

jest.mock('services/repos')
jest.mock('react-use/lib/useIntersection')

beforeAll(() => {
  jest.useFakeTimers().setSystemTime(new Date('2022-04-20'))
})
afterAll(() => {
  jest.useRealTimers()
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
    <Route path="/analytics/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('ChartSelectors', () => {
  afterEach(() => jest.resetAllMocks())

  function setup(useReposMock) {
    // https://github.com/testing-library/user-event/issues/1034
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    const fetchNextPage = jest.fn()
    const repositories = [
      {
        private: false,
        author: {
          username: 'owner1',
        },
        name: 'Repo name 1',
        latestCommitAt: subDays(new Date(), 3),
        coverage: 43,
        active: true,
      },
      {
        private: false,
        author: {
          username: 'owner2',
        },
        name: 'Repo name 3',
        latestCommitAt: subDays(new Date(), 4),
        coverage: 35,
        active: false,
      },
    ]

    useRepos.mockReturnValue({
      data: { repos: repositories },
      fetchNextPage,
      hasNextPage: useReposMock?.hasNextPage || true,
    })

    return { fetchNextPage, user }
  }

  describe('renders component', () => {
    beforeEach(() => setup())

    it('renders date picker', async () => {
      render(
        <ChartSelectors
          owner="bob"
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const datePicker = screen.getByPlaceholderText('Start Date')
      expect(datePicker).toBeInTheDocument()
    })

    it('renders multiselect', async () => {
      render(
        <ChartSelectors
          owner="bob"
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const multiSelect = await screen.findByText('All Repos')
      expect(multiSelect).toBeInTheDocument()
    })

    it('renders clear filters', async () => {
      render(
        <ChartSelectors
          owner="bob"
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      const clearFilters = await screen.findByText('Clear filters')
      expect(clearFilters).toBeInTheDocument()
    })
  })

  describe('interacting with the date picker', () => {
    it('updates the value', async () => {
      const { user } = setup()
      render(
        <ChartSelectors
          owner="bob"
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
        />,
        { wrapper }
      )

      let datePicker = screen.getByPlaceholderText('Start Date')
      await user.click(datePicker)

      const selectedDate = screen.getByRole('option', {
        name: 'Choose Wednesday, March 23rd, 2022',
      })
      await user.click(selectedDate)

      datePicker = screen.getByPlaceholderText('Start Date')
      expect(datePicker.value).toBe('03/23/2022 - ')
    })

    it('updates the location params', async () => {
      const { user } = setup()
      const updateParams = jest.fn()
      render(
        <ChartSelectors
          owner="bob"
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

      let datePicker = screen.getByPlaceholderText('Start Date')
      await user.click(datePicker)

      const selectedDate = screen.getByRole('option', {
        name: 'Choose Wednesday, March 23rd, 2022',
      })
      await user.click(selectedDate)

      expect(updateParams).toBeCalledWith({
        endDate: null,
        startDate: new Date('2022-03-23T00:00:00.000Z'),
      })
    })
  })

  describe('interacting with the multi select', () => {
    it('displays list of repos when opened', async () => {
      const { user } = setup()
      render(
        <ChartSelectors
          owner="bob"
          active={true}
          sortItem={{
            ordering: 'NAME',
            direction: 'ASC',
          }}
          params={{ search: 'Repo name 1', repositories: [] }}
          updateParams={jest.fn()}
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
        const { user } = setup()
        render(
          <ChartSelectors
            owner="bob"
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: ['Repo name 1'] }}
            updateParams={jest.fn()}
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
        const { user } = setup()
        const updateParams = jest.fn()
        render(
          <ChartSelectors
            owner="bob"
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
          expect(updateParams).toBeCalledWith({ repositories: ['Repo name 1'] })
        )
      })
    })

    describe('when searching for a repo', () => {
      it('displays the searchbox', async () => {
        const { user } = setup()
        render(
          <ChartSelectors
            owner="bob"
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={jest.fn()}
          />,
          { wrapper }
        )

        const multiselect = screen.getByText('All Repos')
        await user.click(multiselect)

        const searchBox = screen.getByPlaceholderText('Search for Repos')
        expect(searchBox).toBeInTheDocument()
      })

      it('updates the textbox value when typing', async () => {
        const { user } = setup()
        render(
          <ChartSelectors
            owner="bob"
            active={true}
            sortItem={{
              ordering: 'NAME',
              direction: 'ASC',
            }}
            params={{ search: 'Repo name 1', repositories: [] }}
            updateParams={jest.fn()}
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
          expect(useRepos).toBeCalledWith({
            active: true,
            first: Infinity,
            owner: 'bob',
            sortItem: {
              direction: 'ASC',
              ordering: 'NAME',
            },
            suspense: false,
            term: 'codecov',
          })
        })
      })
    })

    describe('when onLoadMore is triggered', () => {
      describe('when there is a next page', () => {
        it('calls fetchNextPage', async () => {
          const { user, fetchNextPage } = setup()
          useIntersection.mockReturnValue({
            isIntersecting: true,
          })

          render(
            <ChartSelectors
              owner="bob"
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={jest.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          expect(fetchNextPage).toBeCalled()
        })
      })

      describe('when there is no next page', () => {
        it('does not calls fetchNextPage', async () => {
          const { user, fetchNextPage } = setup({ hasNextPage: false })

          render(
            <ChartSelectors
              owner="bob"
              active={true}
              sortItem={{
                ordering: 'NAME',
                direction: 'ASC',
              }}
              params={{ search: 'Repo name 1', repositories: [] }}
              updateParams={jest.fn()}
            />,
            { wrapper }
          )

          const multiselect = screen.getByText('All Repos')
          await user.click(multiselect)

          expect(fetchNextPage).not.toBeCalled()
        })
      })
    })
  })

  describe('interacting with clear filters', () => {
    it('updates params', async () => {
      const { user } = setup()
      const updateParams = jest.fn()
      render(
        <ChartSelectors
          owner="bob"
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
})
