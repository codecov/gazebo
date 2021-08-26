import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'
import { useParams, MemoryRouter } from 'react-router-dom'

import { useResyncUser } from 'services/user'
import ResyncButton from './ResyncButton'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(),
}))
jest.mock('services/user/hooks')

describe('ResyncButton', () => {
  function setup(returnValueResync, provider) {
    useParams.mockReturnValue({ provider })
    useResyncUser.mockReturnValue(returnValueResync)
    render(<ResyncButton />, { wrapper: MemoryRouter })
  }

  describe('when rendered with gh provider and the sync is not in progress', () => {
    const trigger = jest.fn()

    beforeEach(() => {
      setup(
        {
          isSyncing: false,
          triggerResync: trigger,
        },
        'gh'
      )
    })

    it('renders the button to resync', () => {
      expect(
        screen.getByRole('button', {
          name: /re-sync/i,
        })
      ).toBeInTheDocument()
    })

    it('renders text related to gh provider', () => {
      expect(screen.getByText(/or org?/)).toBeInTheDocument()
      expect(screen.getByText(/admin approval/)).toBeInTheDocument()
    })

    describe('when the user clicks on the button', () => {
      beforeEach(() => {
        userEvent.click(
          screen.getByRole('button', {
            name: /re-sync/i,
          })
        )
      })

      it('calls the triggerResync from the service', () => {
        expect(trigger).toHaveBeenCalled()
      })
    })
  })

  describe('when rendered without gh provider and the sync is not in progress', () => {
    const trigger = jest.fn()

    beforeEach(() => {
      setup(
        {
          isSyncing: false,
          triggerResync: trigger,
        },
        'not-gh'
      )
    })

    it('shouldnt render text related to gh provider', () => {
      expect(screen.queryByText(/or org?/)).toBeNull()
      expect(screen.queryByText(/admin approval/)).toBeNull()
    })
  })

  describe('when the syncing is in progress', () => {
    beforeEach(() => {
      setup(
        {
          isSyncing: true,
          triggerResync: () => null,
        },
        'gh'
      )
    })

    it('renders a loading message', () => {
      expect(screen.getByText(/Syncing\.\.\./i)).toBeInTheDocument()
    })
  })
})
