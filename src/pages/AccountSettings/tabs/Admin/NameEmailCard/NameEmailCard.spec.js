import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NameEmailCard from './NameEmailCard'
import { useUser } from 'services/user'

jest.mock('services/user')

const user = {
  name: 'donald duck',
  email: 'donald@duck.com',
}

describe('NameEmailCard', () => {
  function setup() {
    useUser.mockReturnValue({
      data: user,
    })
    render(<NameEmailCard />)
  }

  describe('when rendered', () => {
    beforeEach(setup)

    it('renders the name and email input with the data of the user', () => {
      expect(
        screen.getByRole('textbox', {
          name: /name/i,
        })
      ).toHaveValue(user.name)
      expect(
        screen.getByRole('textbox', {
          name: /email/i,
        })
      ).toHaveValue(user.email)
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

    it('submits', () => {
      // implementation in next PR
      expect(1).toBe(1)
    })
  })
})
