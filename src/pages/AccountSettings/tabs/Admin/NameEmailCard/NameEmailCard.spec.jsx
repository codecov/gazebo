import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useAddNotification } from 'services/toastNotification'
import { useUpdateProfile } from 'services/user'

import NameEmailCard from './NameEmailCard'

jest.mock('services/user/hooks')
jest.mock('services/toastNotification')

const currentUser = {
  user: {
    name: 'donald duck',
  },
  email: 'donald@duck.com',
}

describe('NameEmailCard', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup() {
    useAddNotification.mockReturnValue(addNotification)
    useUpdateProfile.mockReturnValue({ mutate, isLoading: false })
    render(<NameEmailCard currentUser={currentUser} provider="gh" />)
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('renders the name and email input with the data of the user', () => {
      expect(
        screen.getByRole('textbox', {
          name: /name/i,
        })
      ).toHaveValue(currentUser.user.name)
      expect(
        screen.getByRole('textbox', {
          name: /email/i,
        })
      ).toHaveValue(currentUser.email)
    })

    it('has the submit button disabled', () => {
      expect(
        screen.getByRole('button', {
          name: /save changes/i,
        })
      ).toBeDisabled()
    })
  })

  describe('when updating one field', () => {
    beforeEach(() => {
      setup()
      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      userEvent.type(emailField, '{backspace}{backspace}{backspace}nl')
    })

    it('updates the field with the right value', () => {
      expect(
        screen.getByRole('textbox', {
          name: /email/i,
        })
      ).toHaveValue('donald@duck.nl')
    })
  })

  describe('when submitting with an empty name', () => {
    beforeEach(() => {
      setup()
      const nameField = screen.getByRole('textbox', {
        name: /name/i,
      })
      act(() => {
        userEvent.type(nameField, '{selectall}{backspace}')
      })
      return act(async () => {
        userEvent.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )
      })
    })

    it('renders an error message', () => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  describe('when submitting with an empty email', () => {
    beforeEach(() => {
      setup()
      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      act(() => {
        userEvent.type(emailField, '{selectall}{backspace}')
      })
      return act(async () => {
        userEvent.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )
      })
    })

    it('renders an error message', () => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  describe('when submitting with a wrong email', () => {
    beforeEach(() => {
      setup()
      const emailField = screen.getByRole('textbox', {
        name: /email/i,
      })
      act(() => {
        userEvent.type(emailField, '{selectall}{backspace}blaabla')
      })
      return act(async () => {
        userEvent.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )
      })
    })

    it('renders an error message', () => {
      expect(screen.getByText('Not a valid email')).toBeInTheDocument()
    })
  })

  describe('when submitting correct data', () => {
    beforeEach(() => {
      setup()
      const nameField = screen.getByRole('textbox', {
        name: /name/i,
      })
      act(() => {
        userEvent.type(nameField, '{selectall}{backspace}picsou')
      })
      return act(() => {
        userEvent.click(
          screen.getByRole('button', {
            name: /save changes/i,
          })
        )
        return Promise.resolve()
      })
    })

    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successful', () => {
      beforeEach(() => {
        // simulating the onSuccess callback given to mutate
        act(() => {
          mutate.mock.calls[0][1].onSuccess({
            user: {
              name: 'picsou',
            },
            email: 'picsou@gmail.com',
          })
        })
      })

      it('adds a success notification', () => {
        expect(addNotification).toHaveBeenCalledWith({
          type: 'success',
          text: 'Information successfully updated',
        })
      })
    })

    describe('when mutation is not successful', () => {
      beforeEach(() => {
        // simulating the onError callback given to useCancelPlan
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
