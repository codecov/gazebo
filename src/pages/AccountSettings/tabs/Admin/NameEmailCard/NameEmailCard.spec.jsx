import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'

import NameEmailCard from './NameEmailCard'

jest.mock('services/user')
jest.mock('services/toastNotification')

describe('NameEmailCard', () => {
  function setup() {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)
    useUpdateProfile.mockReturnValue({ mutate, isLoading: false })

    return { mutate, addNotification, user }
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('renders the name and email input with the data of the user', () => {
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const name = screen.getByRole('textbox', {
        name: /name/i,
      })
      expect(name).toHaveValue('donald duck')

      const email = screen.getByRole('textbox', { name: /email/i })
      expect(email).toHaveValue('donald@duck.com')
    })

    it('has the submit button disabled', () => {
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const saveChangesButton = screen.getByRole('button', {
        name: /save changes/i,
      })
      expect(saveChangesButton).toBeDisabled()
    })
  })

  describe('when updating one field', () => {
    it('updates the field with the right value', async () => {
      const { user } = setup()
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      await user.type(emailField, '{backspace}{backspace}{backspace}nl')

      expect(
        screen.getByRole('textbox', {
          name: /email/i,
        })
      ).toHaveValue('donald@duck.nl')
    })
  })

  describe('when submitting with an empty name', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const nameField = screen.getByRole('textbox', {
        name: /name/i,
      })
      await user.tripleClick(nameField)
      await user.keyboard('{backspace}')

      const saveChanges = screen.getByRole('button', {
        name: /save changes/i,
      })
      await user.click(saveChanges)

      const nameIsRequired = screen.getByText('Name is required')
      expect(nameIsRequired).toBeInTheDocument()
    })
  })

  describe('when submitting with an empty email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}')
      await user.click(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      )

      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  describe('when submitting with a wrong email', () => {
    it('renders an error message', async () => {
      const { user } = setup()
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      await user.tripleClick(emailField)
      await user.keyboard('{backspace}blaabla')
      await user.click(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      )

      expect(screen.getByText('Not a valid email')).toBeInTheDocument()
    })
  })

  describe('when submitting correct data', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup()
      render(
        <NameEmailCard
          currentUser={{
            user: {
              name: 'donald duck',
            },
            email: 'donald@duck.com',
          }}
          provider="gh"
        />
      )

      const nameField = screen.getByRole('textbox', {
        name: /name/i,
      })
      await user.tripleClick(nameField)
      await user.keyboard('{backspace}picsou')
      await user.click(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      )

      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successful', () => {
      it('adds a success notification', async () => {
        const { user, mutate, addNotification } = setup()
        render(
          <NameEmailCard
            currentUser={{
              user: {
                name: 'donald duck',
              },
              email: 'donald@duck.com',
            }}
            provider="gh"
          />
        )

        const nameField = screen.getByRole('textbox', {
          name: /name/i,
        })
        await user.tripleClick(nameField)
        await user.keyboard('{backspace}picsou')
        await user.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )

        // simulating the onSuccess callback given to mutate
        mutate.mock.calls[0][1].onSuccess({
          user: {
            name: 'picsou',
          },
          email: 'picsou@gmail.com',
        })
        expect(addNotification).toHaveBeenCalledWith({
          type: 'success',
          text: 'Information successfully updated',
        })
      })
    })

    describe('when mutation is not successful', () => {
      it('adds an error notification', async () => {
        const { user, mutate, addNotification } = setup()
        render(
          <NameEmailCard
            currentUser={{
              user: {
                name: 'donald duck',
              },
              email: 'donald@duck.com',
            }}
            provider="gh"
          />
        )

        const nameField = screen.getByRole('textbox', {
          name: /name/i,
        })
        await user.tripleClick(nameField)
        await user.keyboard('{backspace}picsou')
        await user.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )
        // simulating the onError callback given to useCancelPlan
        mutate.mock.calls[0][1].onError()

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
        })
      })
    })
  })
})
