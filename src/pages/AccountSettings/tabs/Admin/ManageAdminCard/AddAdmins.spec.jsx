import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUsers } from 'services/users'

import AddAdmins from './AddAdmins'

jest.mock('services/users')

const users = [
  { username: 'dorian', email: 'dorian@codecov.io', name: 'dorian' },
]

describe('AddAdmins', () => {
  const props = {
    provider: 'gh',
    owner: 'codecov',
    setAdminStatus: jest.fn(),
  }

  function setup(userResults = [], isLoading = false) {
    useUsers.mockReturnValue({
      data: {
        results: userResults,
      },
      isLoading,
    })
    render(<AddAdmins {...props} />)
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup([])
    })

    it('renders an empty input', () => {
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('doesnt render any dropdown', () => {
      expect(screen.getByRole('listbox')).toHaveClass('hidden')
    })

    it('doesnt call the API', () => {
      expect(useUsers.mock.calls[0][0].opts.enabled).toBeFalsy()
    })
  })

  describe('when typing and the api is loading', () => {
    beforeEach(() => {
      setup([], true)
      userEvent.type(screen.getByRole('textbox'), 'hello')
    })

    it('renders the dropdown', () => {
      expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    })

    it('renders the loading state', () => {
      expect(screen.getByText(/loading/)).toBeInTheDocument()
    })
  })

  describe('when typing and the api returns no data', () => {
    beforeEach(() => {
      setup([])
      userEvent.type(screen.getByRole('textbox'), 'hello')
    })

    it('renders the dropdown', () => {
      expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    })

    it('renders the empty state', () => {
      expect(screen.getByText(/No users found/)).toBeInTheDocument()
    })
  })

  describe('when typing and the api returns users', () => {
    beforeEach(() => {
      setup(users)
      userEvent.type(screen.getByRole('textbox'), 'hello')
    })

    it('renders the dropdown', () => {
      expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    })

    it('renders the users', () => {
      expect(screen.getAllByText(users[0].name)).not.toHaveLength(0)
      expect(screen.getAllByText(users[0].username)).not.toHaveLength(0)
      expect(screen.getAllByText(users[0].email)).not.toHaveLength(0)
    })
  })

  describe('when clicking on a user', () => {
    beforeEach(() => {
      setup(users)
      userEvent.type(screen.getByRole('textbox'), 'hello')
      userEvent.click(
        screen.getByRole('option', {
          name: new RegExp(users[0].name, 'i'),
        })
      )
    })

    it('calls the setAdminStatus with the user', () => {
      expect(props.setAdminStatus).toHaveBeenCalledWith(users[0], true)
    })

    it('resets the text input', () => {
      expect(screen.getByRole('textbox')).toHaveValue('')
    })

    it('doesnt render the dropdown anymore', () => {
      expect(screen.getByRole('listbox')).toHaveClass('hidden')
    })
  })
})
