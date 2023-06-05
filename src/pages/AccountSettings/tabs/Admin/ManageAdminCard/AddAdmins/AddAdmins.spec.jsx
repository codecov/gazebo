import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUsers } from 'services/users'

import AddAdmins from './AddAdmins'

jest.mock('services/users')

describe('AddAdmins', () => {
  function setup(userResults = [], isLoading = false) {
    const user = userEvent.setup()

    useUsers.mockReturnValue({
      data: {
        results: userResults,
      },
      isLoading,
    })

    return { user }
  }

  describe('when rendered', () => {
    beforeEach(() => setup([]))

    it('renders an empty input', () => {
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      expect(textbox).toHaveValue('')
    })

    it(`doesn't render any dropdown`, () => {
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const listBox = screen.getByRole('listbox')
      expect(listBox).toHaveClass('hidden')
    })

    it(`doesn't call the API`, () => {
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      expect(useUsers.mock.calls[0][0].opts.enabled).toBeFalsy()
    })
  })

  describe('when typing and the api is loading', () => {
    it('renders the dropdown', async () => {
      const { user } = setup([], true)
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const hideDropdown = screen.getByRole('listbox')
      expect(hideDropdown).not.toHaveClass('hidden')
    })

    it('renders the loading state', async () => {
      const { user } = setup([], true)
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      expect(await screen.findByRole('combobox')).toBeTruthy()
      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      expect(await screen.findByText(/Loading.../)).toBeTruthy()
      const loading = screen.getByText(/Loading.../)
      expect(loading).toBeInTheDocument()
    })
  })

  describe('when typing and the api returns no data', () => {
    it('renders the dropdown', async () => {
      const { user } = setup([])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const hideDropdown = screen.getByRole('listbox')
      expect(hideDropdown).not.toHaveClass('hidden')
    })

    it('renders the empty state', async () => {
      const { user } = setup([])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      expect(screen.getByText(/No users found/)).toBeInTheDocument()
    })
  })

  describe('when typing and the api returns users', () => {
    it('renders the dropdown', async () => {
      const { user } = setup([
        { username: 'launda', email: 'c3@cr.io', name: 'laudna' },
      ])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      expect(screen.getByRole('listbox')).not.toHaveClass('hidden')
    })

    it('renders the users', async () => {
      const { user } = setup([
        { username: 'funspooky', email: 'c3@cr.io', name: 'laudna' },
      ])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const username = await screen.findByText('@funspooky')
      expect(username).toBeInTheDocument()

      const laudna = await screen.findByText('laudna')
      expect(laudna).toBeInTheDocument()

      const email = await screen.findByText('c3@cr.io')
      expect(email).toBeInTheDocument()
    })
  })

  describe('when clicking on a user', () => {
    it('calls the setAdminStatus with the user', async () => {
      const users = [{ username: 'launda', email: 'c3@cr.io', name: 'laudna' }]
      const { user } = setup(users)
      const setAdminStatus = jest.fn()
      render(
        <AddAdmins
          provider="gh"
          owner="codecov"
          setAdminStatus={setAdminStatus}
        />
      )

      let textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const userOption = screen.getByRole('option', {
        name: new RegExp('launda', 'i'),
      })
      await user.click(userOption)

      expect(setAdminStatus).toHaveBeenCalledWith(users[0], true)
    })

    it('resets the text input', async () => {
      const { user } = setup([
        { username: 'launda', email: 'c3@cr.io', name: 'laudna' },
      ])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      let textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const userOption = screen.getByRole('option', {
        name: new RegExp('launda', 'i'),
      })
      await user.click(userOption)

      textbox = screen.getByRole('combobox')
      expect(textbox).toHaveValue('')
    })

    it(`doesn't render the dropdown anymore`, async () => {
      const { user } = setup([
        { username: 'launda', email: 'c3@cr.io', name: 'laudna' },
      ])
      render(
        <AddAdmins provider="gh" owner="codecov" setAdminStatus={jest.fn()} />
      )

      const textbox = screen.getByRole('combobox')
      await user.type(textbox, 'hello')

      const userOption = screen.getByRole('option', {
        name: new RegExp('launda', 'i'),
      })
      await user.click(userOption)

      const hideDropdown = screen.getByRole('listbox')
      expect(hideDropdown).toHaveClass('hidden')
    })
  })
})
