import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useEraseAccount } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import DeletionCard from './DeletionCard'

jest.mock('services/account')
jest.mock('services/toastNotification')

describe('DeletionCard', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    useEraseAccount.mockReturnValue({ mutate, isLoading: false })

    return { mutate, addNotification, user }
  }

  describe('when rendered for organization', () => {
    beforeEach(() => setup())

    it('renders the copy for organization', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={false}
        />,
        {
          wrapper: MemoryRouter,
        }
      )

      const EraseOrgContent = screen.getByText(
        /Erase all my organization content and projects/
      )
      expect(EraseOrgContent).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={false}
        />,
        {
          wrapper: MemoryRouter,
        }
      )

      const contactSupport = screen.getByRole('link', {
        name: /contact support/i,
      })
      expect(contactSupport).toBeInTheDocument()
    })
  })

  describe('when rendering for individual', () => {
    beforeEach(setup)

    it('renders the copy for individual', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        {
          wrapper: MemoryRouter,
        }
      )

      const eraseAllContent = screen.getByText(
        /erase all my personal content and personal projects\./i
      )
      expect(eraseAllContent).toBeInTheDocument()
    })

    it('has a link to the support page', () => {
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        {
          wrapper: MemoryRouter,
        }
      )

      const eraseAccount = screen.getByRole('button', {
        name: /erase account/i,
      })
      expect(eraseAccount).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to erase', () => {
    it('opens the modal with warning', async () => {
      const { user } = setup()
      render(
        <DeletionCard
          provider="gh"
          owner="codecov"
          isPersonalSettings={true}
        />,
        {
          wrapper: MemoryRouter,
        }
      )

      const eraseAccount = screen.getByRole('button', {
        name: /erase account/i,
      })
      await user.click(eraseAccount)

      const areYouSure = screen.getByRole('heading', {
        name: /are you sure\?/i,
      })
      expect(areYouSure).toBeInTheDocument()
    })

    describe('when clicking Cancel', () => {
      beforeEach(() => {})

      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          {
            wrapper: MemoryRouter,
          }
        )

        const eraseAccount = screen.getByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseAccount)

        const cancel = screen.getByRole('button', { name: /Cancel/ })
        await user.click(cancel)

        const areYouSure = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(areYouSure).not.toBeInTheDocument()
      })
    })

    describe('when clicking Close icon', () => {
      it('closes the modal', async () => {
        const { user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          {
            wrapper: MemoryRouter,
          }
        )

        const eraseAccount = screen.getByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseAccount)

        const close = screen.getByRole('button', { name: /Close/ })
        await user.click(close)

        const areYouSure = screen.queryByRole('heading', {
          name: /are you sure\?/i,
        })
        expect(areYouSure).not.toBeInTheDocument()
      })
    })

    describe('when confirming', () => {
      it('calls the mutation', async () => {
        const { mutate, user } = setup()
        render(
          <DeletionCard
            provider="gh"
            owner="codecov"
            isPersonalSettings={true}
          />,
          {
            wrapper: MemoryRouter,
          }
        )

        const eraseAccount = screen.getByRole('button', {
          name: /erase account/i,
        })
        await user.click(eraseAccount)

        const eraseMyAccount = screen.getByRole('button', {
          name: /Erase my account/,
        })
        await user.click(eraseMyAccount)

        expect(mutate).toHaveBeenCalled()
      })

      describe('when the mutation fails', () => {
        it('adds an error notification', async () => {
          const { mutate, user, addNotification } = setup()
          render(
            <DeletionCard
              provider="gh"
              owner="codecov"
              isPersonalSettings={true}
            />,
            {
              wrapper: MemoryRouter,
            }
          )

          const eraseAccount = screen.getByRole('button', {
            name: /erase account/i,
          })
          await user.click(eraseAccount)

          const eraseMyAccount = screen.getByRole('button', {
            name: /Erase my account/,
          })
          await user.click(eraseMyAccount)

          mutate.mock.calls[0][1].onError()

          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'Something went wrong',
          })
        })
      })
    })
  })
})
