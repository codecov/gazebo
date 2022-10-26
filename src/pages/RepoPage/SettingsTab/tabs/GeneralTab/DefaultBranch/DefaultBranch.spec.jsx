import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useBranches } from 'services/branches'
import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import DefaultBranch from './DefaultBranch'

jest.mock('services/branches')
jest.mock('services/repo')
jest.mock('services/toastNotification')
jest.mock('react-use/lib/useIntersection')

const queryClient = new QueryClient()

describe('DefaultBranch', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()
  const fetchNextPage = jest.fn()

  function setup(branch) {
    useBranches.mockReturnValue({
      data: {
        branches: [
          {
            name: 'master',
            head: {
              commitid: '1',
            },
          },
          {
            name: 'dummy',
            head: {
              commitid: '2',
            },
          },
          {
            name: 'dummy2',
            head: {
              commitid: '3',
            },
          },
        ],
      },
      fetchNextPage,
      hasNextPage: true,
    })
    useAddNotification.mockReturnValue(addNotification)
    useUpdateRepo.mockReturnValue({
      mutate,
      data: { branch },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">
            <DefaultBranch defaultBranch="master" />
          </Route>
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('renders Default Branch componenet', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Default Branch/)
      expect(title).toBeInTheDocument()
    })
    it('renders body', () => {
      const p = screen.getByText(
        'Selection for branch context of data in coverage dashboard'
      )
      expect(p).toBeInTheDocument()
    })
    it('renders branch context', () => {
      const label = screen.getByText(/Branch Context/)
      expect(label).toBeInTheDocument()
      const select = screen.getByRole('button', {
        name: 'Branch selector',
      })
      expect(select).toBeInTheDocument()
    })
  })

  describe('when clicking on select btn', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: 'Branch selector' }))
    })
    it('renders all branches of repo', () => {
      const branch1 = screen.getByText('dummy')
      expect(branch1).toBeInTheDocument()
      const branch2 = screen.getByText('dummy2')
      expect(branch2).toBeInTheDocument()
    })

    describe('when user selects a branch', () => {
      beforeEach(() => {
        userEvent.click(screen.getByText('dummy'))
      })
      it('calls the mutation', () => {
        expect(mutate).toHaveBeenCalled()
      })
    })
  })

  describe('when mutation returns new default', () => {
    beforeEach(() => {
      setup('dummy')
    })

    it('renders new default branch', () => {
      expect(screen.getByText('dummy')).toBeInTheDocument()
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: 'Branch selector' }))
      userEvent.click(screen.getByText('dummy'))
      mutate.mock.calls[0][1].onError()
    })
    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    it('adds an error notification', () => {
      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: 'We were unable to update the default branch for this repo',
      })
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('when there is a next page', () => {
      beforeEach(() => {
        setup()
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })
      it('calls fetchNextPage', () => {
        const select = screen.getByText('master')
        userEvent.click(select)

        expect(fetchNextPage).toBeCalled()
      })
    })

    describe('when there is not a next page', () => {
      const fetchNextPage = jest.fn()
      beforeEach(() => {
        setup()
        useBranches.mockReturnValue({
          data: { branches: [{ name: 'master', head: { commitid: '1' } }] },
          fetchNextPage,
          hasNextPage: false,
        })
        useIntersection.mockReturnValue({
          isIntersecting: true,
        })
      })

      it('does not call fetchNextPage', () => {
        const select = screen.getByText('master')
        userEvent.click(select)

        expect(fetchNextPage).not.toBeCalled()
      })
    })
  })
})
