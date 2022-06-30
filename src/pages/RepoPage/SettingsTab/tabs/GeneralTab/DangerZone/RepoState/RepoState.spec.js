import { render, screen } from 'custom-testing-library'

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepo } from 'services/repo'
import { useAddNotification } from 'services/toastNotification'

import RepoState from './RepoState'
import useRepoActivation from './useRepoActivation'

import { ActivationStatusContext } from '../../Context'

jest.mock('services/repo')
jest.mock('services/toastNotification')
jest.mock('./useRepoActivation')

describe('RepoState', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()
  const refetch = jest.fn()
  const toggleRepoState = jest.fn()

  function setup(activated = false, newDataActivated = false) {
    useRepo.mockReturnValue({
      refetch,
    })

    useAddNotification.mockReturnValue(addNotification)
    useRepoActivation.mockReturnValue({
      toggleRepoState,
      data: {
        activated: newDataActivated,
      },
    })

    render(
      <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
        <Route path="/:provider/:owner/:repo/settings">
          <ActivationStatusContext.Provider value={activated}>
            <RepoState />
          </ActivationStatusContext.Provider>
        </Route>
      </MemoryRouter>
    )
  }

  describe('renders DeactivateRepo component', () => {
    beforeEach(() => {
      setup()
    })
    it('renders title', () => {
      const title = screen.getByText(/Repo has been deactivated/)
      expect(title).toBeInTheDocument()
    })

    it('renders Activate Repo button', () => {
      expect(
        screen.getByRole('button', { name: 'Activate' })
      ).toBeInTheDocument()
    })
  })

  describe('when the user clicks on Activate button', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: 'Activate' }))
    })

    it('calls the mutation', () => {
      expect(toggleRepoState).toHaveBeenCalled()
    })

    it('calls getRepo refetch', async () => {
      await waitFor(() => expect(refetch).toHaveBeenCalled())
    })
  })

  describe('when mutation data has active set to true', () => {
    beforeEach(() => {
      setup(true)
    })

    it('displays deactivate button', () => {
      expect(
        screen.getByRole('button', { name: 'Deactivate' })
      ).toBeInTheDocument()
    })

    it('displays the warning', () => {
      const warning = screen.getByText('This will prevent any further uploads')
      expect(warning).toBeInTheDocument()
    })

    describe('when the user clicks on Deactivate button', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: 'Deactivate' }))
      })

      it('displays Deactivate Repo Modal', () => {
        expect(
          screen.getByText('Are you sure you want to deactivate the repo?')
        ).toBeInTheDocument()
        expect(
          screen.getByText(
            'Deactivate repo will deactivate a repo and prevent the upload of coverage information to that repo going forward. You will be able to reactivate the repo at any time.'
          )
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Deactivate repo' })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: 'Cancel' })
        ).toBeInTheDocument()
      })

      describe('when user clicks on Cancel button', () => {
        beforeEach(() => {
          userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        })
        it('does not call the mutation', () => {
          expect(mutate).not.toHaveBeenCalled()
        })
      })

      describe('when user clicks on Deactivate button', () => {
        beforeEach(() => {
          userEvent.click(
            screen.getByRole('button', { name: 'Deactivate repo' })
          )
        })
        it('calls the mutation', () => {
          expect(toggleRepoState).toHaveBeenCalled()
        })
      })
    })
  })

  describe('when data is returned from mutation hook', () => {
    beforeEach(() => {
      setup(false, true)
    })
    it('populates the value based on new data', () => {
      expect(screen.getByText(/Deactivate repo/)).toBeInTheDocument()
    })
  })
})
