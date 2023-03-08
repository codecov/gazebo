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
  let props
  let repositories
  const updateParams = jest.fn()
  const fetchNextPage = jest.fn()

  beforeEach(() => {
    const owner = 'bob'
    const active = true
    const sortItem = {
      ordering: 'NAME',
      direction: 'ASC',
    }

    repositories = [
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

    const params = {
      search: 'Repo name 1',
      repositories: [],
    }

    useRepos.mockReturnValue({
      data: { repos: repositories },
      fetchNextPage,
      hasNextPage: true,
    })

    props = {
      active,
      owner,
      sortItem,
      params,
      updateParams,
    }
  })

  describe('renders component', () => {
    it('renders date picker', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const datePicker = await screen.findByPlaceholderText('Start Date')
      expect(datePicker).toBeInTheDocument()
    })

    it('renders multiselect', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const multiSelect = await screen.findByText('All Repos')
      expect(multiSelect).toBeInTheDocument()
    })

    it('renders clear filters', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const clearFilters = await screen.findByText('Clear filters')
      expect(clearFilters).toBeInTheDocument()
    })
  })

  describe('interacting with the date picker', () => {
    it('updates the value', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const datePicker = await screen.findByPlaceholderText('Start Date')
      userEvent.click(datePicker)

      const selectedDate = await screen.findByRole('option', {
        name: 'Choose Wednesday, March 23rd, 2022',
      })
      userEvent.click(selectedDate)

      await waitFor(() => expect(datePicker.value).toBe('03/23/2022 - '))
    })

    it('updates the location params', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const datePicker = await screen.findByPlaceholderText('Start Date')
      userEvent.click(datePicker)

      const selectedDate = await screen.findByRole('option', {
        name: 'Choose Wednesday, March 23rd, 2022',
      })
      userEvent.click(selectedDate)

      await waitFor(() =>
        expect(updateParams).toBeCalledWith({
          endDate: null,
          startDate: new Date('2022-03-23T00:00:00.000Z'),
        })
      )
    })
  })

  describe('interacting with the multi select', () => {
    it('displays list of repos when opened', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const multiselect = await screen.findByText('All Repos')
      userEvent.click(multiselect)

      const repo1 = await screen.findByText('Repo name 1')
      expect(repo1).toBeInTheDocument()

      const repo3 = await screen.findByText('Repo name 3')
      expect(repo3).toBeInTheDocument()
    })

    describe('when item clicked', () => {
      it('updates button value', async () => {
        render(<ChartSelectors {...props} />, { wrapper })

        const multiselect = await screen.findByText('All Repos')
        userEvent.click(multiselect)

        const repo1 = await screen.findByText('Repo name 1')
        userEvent.click(repo1)

        const multiSelectUpdated = await screen.findByText('1 Repo selected')
        expect(multiSelectUpdated).toBeInTheDocument()
      })

      it('updates url params', async () => {
        render(<ChartSelectors {...props} />, { wrapper })

        const multiselect = await screen.findByText('All Repos')
        userEvent.click(multiselect)

        const repo1 = await screen.findByText('Repo name 1')
        userEvent.click(repo1)

        await waitFor(() =>
          expect(updateParams).toBeCalledWith({ repositories: ['Repo name 1'] })
        )
      })
    })

    describe('when searching for a repo', () => {
      it('displays the searchbox', async () => {
        render(<ChartSelectors {...props} />, { wrapper })

        const multiselect = await screen.findByText('All Repos')
        userEvent.click(multiselect)

        const searchBox = await screen.findByPlaceholderText('Search for Repos')
        expect(searchBox).toBeInTheDocument()
      })

      it('updates the textbox value when typing', async () => {
        render(<ChartSelectors {...props} />, { wrapper })

        const multiselect = await screen.findByText('All Repos')
        userEvent.click(multiselect)

        const searchBox = await screen.findByPlaceholderText('Search for Repos')
        userEvent.type(searchBox, 'codecov')

        const searchBoxUpdated = await screen.findByPlaceholderText(
          'Search for Repos'
        )
        expect(searchBoxUpdated).toHaveAttribute('value', 'codecov')

        await waitFor(() =>
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
        )
      })
    })

    describe('when onLoadMore is triggered', () => {
      describe('when there is a next page', () => {
        beforeEach(() => {
          useRepos.mockReturnValue({
            data: { repos: repositories },
            fetchNextPage,
            hasNextPage: true,
          })
          useIntersection.mockReturnValue({
            isIntersecting: true,
          })
        })

        it('calls fetchNextPage', async () => {
          render(<ChartSelectors {...props} />, { wrapper })

          const multiselect = await screen.findByText('All Repos')
          userEvent.click(multiselect)

          await waitFor(() => expect(fetchNextPage).toBeCalled())
        })
      })

      describe('when there is no next page', () => {
        beforeEach(() => {
          useRepos.mockReturnValue({
            data: { repos: repositories },
            fetchNextPage,
            hasNextPage: false,
          })
        })

        it('does not calls fetchNextPage', async () => {
          render(<ChartSelectors {...props} />, { wrapper })

          const multiselect = await screen.findByText('All Repos')
          userEvent.click(multiselect)

          await waitFor(() => expect(fetchNextPage).not.toBeCalled())
        })
      })
    })
  })

  describe('interacting with clear filters', () => {
    it('updates params', async () => {
      render(<ChartSelectors {...props} />, { wrapper })

      const clearFilters = await screen.findByRole('button', {
        name: 'Clear filters',
      })
      userEvent.click(clearFilters)

      await waitFor(() =>
        expect(props.updateParams).toHaveBeenCalledWith({
          endDate: null,
          repositories: [],
          startDate: null,
        })
      )
    })
  })
})
