import { render, screen, fireEvent } from '@testing-library/react'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from 'services/repos/hooks'
import { orderingOptions } from 'services/repos'

import ReposTable from './ReposTable'

jest.mock('services/repos/hooks')

describe('ReposTable', () => {
  let props
  let fetchNextPage = jest.fn(() => {})
  function setup(over = {}, repos, hasNextPage) {
    useRepos.mockReturnValue({
      data: {
        repos,
      },
      hasNextPage,
      fetchNextPage,
    })
    props = {
      active: true,
      searchValue: '',
      sortItem: orderingOptions[0],
      ...over,
    }
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <ReposTable {...props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered with active true', () => {
    beforeEach(() => {
      setup(
        {
          active: true,
        },
        [
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
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 2',
            latestCommitAt: subDays(new Date(), 2),
            coverage: 100,
            active: true,
          },
          {
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 3',
            latestCommitAt: null,
            active: true,
          },
        ]
      )
    })

    it('calls useRepos with the right data', () => {
      expect(useRepos).toHaveBeenCalledWith({
        active: true,
        term: '',
        sortItem: props.sortItem,
      })
    })

    it('renders table repo name', () => {
      const buttons = screen.getAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('renders second column', () => {
      const lastseen1 = screen.getByText(/3 days ago/)
      const lastseen2 = screen.getByText(/2 days ago/)
      expect(lastseen1).toBeInTheDocument()
      expect(lastseen2).toBeInTheDocument()
    })

    it('renders third column', () => {
      const bars = screen.getAllByTestId('org-progress-bar')
      expect(bars.length).toBe(2)
    })

    it('renders handles null coverage', () => {
      const noData = screen.getByText(/No data available/)
      expect(noData).toBeInTheDocument()
    })
  })

  describe('when rendered when active and filterValues', () => {
    beforeEach(() => {
      setup(
        {
          active: true,
          filterValues: ['Repo name 1', 'Repo name 3'],
        },
        [
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
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 2',
            latestCommitAt: subDays(new Date(), 2),
            coverage: 100,
            active: true,
          },
          {
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 3',
            latestCommitAt: null,
            active: true,
          },
        ]
      )
    })

    it('renders table repo name', () => {
      const buttons = screen.getAllByText(/Repo name/)
      expect(buttons.length).toBe(2)
      const repo1 = screen.queryByText(/Repo name 1/)
      expect(repo1).toBeInTheDocument()
      const repo2 = screen.queryByText(/Repo name 2/)
      expect(repo2).not.toBeInTheDocument()
      const repo3 = screen.queryByText(/Repo name 3/)
      expect(repo3).toBeInTheDocument()
    })
  })

  describe('when rendered with active false', () => {
    beforeEach(() => {
      setup(
        {
          active: false,
        },
        [
          {
            private: false,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 1',
            latestCommitAt: subDays(new Date(), 3),
            coverage: 43,
            active: false,
          },
          {
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 2',
            latestCommitAt: subDays(new Date(), 2),
            coverage: 100,
            active: false,
          },
          {
            private: true,
            author: {
              username: 'owner1',
            },
            name: 'Repo name 3',
            latestCommitAt: subDays(new Date(), 5),
            coverage: 0,
            active: false,
          },
        ]
      )
    })

    it('calls useRepos with the right data', () => {
      expect(useRepos).toHaveBeenCalledWith({
        active: false,
        term: '',
        sortItem: props.sortItem,
      })
    })

    it('renders table repo name', () => {
      const buttons = screen.getAllByText(/Repo name/)
      expect(buttons.length).toBe(3)
    })

    it('renders second column', () => {
      const notActiveRepos = screen.getAllByText(/Not yet enabled/)
      expect(notActiveRepos.length).toBe(3)
    })
    it('does not render next page button', () => {
      const button = screen.queryByText(/Load More/)
      expect(button).not.toBeInTheDocument()
    })
  })
  describe('when rendered empty repos', () => {
    beforeEach(() => {
      setup(
        {
          active: true,
        },
        []
      )
    })
    it('renders no repos detected', () => {
      const buttons = screen.getAllByText(/no repos detected/)
      expect(buttons.length).toBe(1)
    })
  })
  describe('when rendered empty search', () => {
    beforeEach(() => {
      setup(
        {
          active: true,
          searchValue: 'something',
        },
        []
      )
    })
    it('renders no results found', () => {
      const buttons = screen.getAllByText(/no results found/)
      expect(buttons.length).toBe(1)
    })
  })
  describe('render next page button', () => {
    beforeEach(() => {
      setup(
        {
          active: true,
          searchValue: 'something',
        },
        [],
        true
      )
    })
    it('renders button', () => {
      const button = screen.getByText(/Load More/)
      expect(button).toBeInTheDocument()
    })
    it('fires next page button click', () => {
      fireEvent.click(screen.getByText(/Load More/))
      expect(fetchNextPage).toHaveBeenCalled()
    })
  })
})
