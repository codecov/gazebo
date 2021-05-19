import { render, screen } from 'custom-testing-library'
import userEvent from '@testing-library/user-event'

import { useResyncUser } from 'services/user'
import ResyncButton from './ResyncButton'

jest.mock('services/user/hooks')

describe('ResyncButton', () => {
  function setup(returnValueResync) {
    useResyncUser.mockReturnValue(returnValueResync)
    render(<ResyncButton />)
  }

  describe('when rendered and the sync is not in progress', () => {
    const trigger = jest.fn()

    beforeEach(() => {
      setup({
        isSyncing: false,
        triggerResync: trigger,
      })
    })

    it('renders the button to resync', () => {
      expect(
        screen.getByRole('button', {
          name: /re-sync/i,
        })
      ).toBeInTheDocument()
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

  describe('when the syncing is in progress', () => {
    beforeEach(() => {
      setup({
        isSyncing: true,
        triggerResync: () => null,
      })
    })

    it('renders a loading message', () => {
      expect(screen.getByText(/Syncing\.\.\./i)).toBeInTheDocument()
    })
  })
})
