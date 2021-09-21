import { render, screen } from 'custom-testing-library'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

import DeletionCard from './DeletionCard'
import { useEraseAccount } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

jest.mock('services/account/hooks')
jest.mock('services/toastNotification')

describe('DeletionCard', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup(over = {}) {
    const props = {
      provider: 'gh',
      owner: 'codecov',
      isPersonalSettings: true,
      ...over,
    }
    useAddNotification.mockReturnValue(addNotification)
    useEraseAccount.mockReturnValue({ mutate, isLoading: false })
    render(<DeletionCard {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered for organization', () => {
    beforeEach(() => {
      setup({
        isPersonalSettings: false,
      })
    })

    it('renders the copy for organization', () => {
      expect(
        screen.getByText(/Erase all my organization content and projects/)
      ).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      expect(
        screen.getByRole('link', {
          name: /contact support/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when rendering for individual', () => {
    beforeEach(setup)

    it('renders the copy for individual', () => {
      expect(
        screen.getByText(
          /erase all my personal content and personal projects\./i
        )
      ).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      expect(
        screen.getByRole('button', {
          name: /erase account/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to erase', () => {
    beforeEach(() => {
      setup()
      userEvent.click(
        screen.getByRole('button', {
          name: /erase account/i,
        })
      )
    })

    it('opens the modal with warning', () => {
      expect(
        screen.getByRole('heading', {
          name: /are you sure\?/i,
        })
      ).toBeInTheDocument()
    })

    describe('when clicking Cancel', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
      })

      it('closes the modal', () => {
        expect(
          screen.queryByRole('heading', {
            name: /are you sure\?/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('when clicking Close icon', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: /Close/ }))
      })

      it('closes the modal', () => {
        expect(
          screen.queryByRole('heading', {
            name: /are you sure\?/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('when confirming', () => {
      beforeEach(() => {
        userEvent.click(
          screen.getByRole('button', { name: /Erase my account/ })
        )
      })

      it('calls the mutation', () => {
        expect(mutate).toHaveBeenCalled()
      })

      describe('when the mutation fails', () => {
        beforeEach(() => {
          mutate.mock.calls[0][1].onError()
        })

        it('adds an error notification', () => {
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'Something went wrong',
          })
        })
      })
    })
  })
})
