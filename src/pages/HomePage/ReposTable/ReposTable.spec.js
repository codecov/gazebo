import { render, screen } from '@testing-library/react'
import { subDays } from 'date-fns'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from 'services/repos/hooks'
import { orderingOptions } from 'services/repos'

import ReposTable from './ReposTable'

jest.mock('services/repos/hooks')

describe('ReposTable', () => {
  let props
  function setup(over = {}, repos) {
    useRepos.mockReturnValue({
      data: {
        repos,
      },
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
  })
})
