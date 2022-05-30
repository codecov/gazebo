import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useBranches } from 'services/branches'
import { useUpdateRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import DefaultBranch from './DefaultBranch'

jest.mock('services/branches')
jest.mock('services/repo')
jest.mock('services/toastNotification')

const queryClient = new QueryClient()

describe('DefaultBranch', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup(branch) {
    useBranches.mockReturnValue({
      data: [
        {
          name: 'master',
        },
        {
          name: 'dummy',
        },
        {
          name: 'dummy2',
        },
      ],
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
        name: 'master chevron-down.svg',
      })
      expect(select).toBeInTheDocument()
    })
  })

  describe('when clicking on select btn', () => {
    beforeEach(() => {
      setup()
      userEvent.click(
        screen.getByRole('button', { name: 'master chevron-down.svg' })
      )
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
      userEvent.click(
        screen.getByRole('button', { name: 'master chevron-down.svg' })
      )
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
})
