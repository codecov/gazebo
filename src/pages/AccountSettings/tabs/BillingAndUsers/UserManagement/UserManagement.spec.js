import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropTypes from 'prop-types'

import { useUsers } from 'services/users'

import UserManagement from './UserManagement'

function MockUserTable({ users, Cta }) {
  return <div>{Cta(users[0])} UserTable</div>
}
MockUserTable.propTypes = {
  Cta: PropTypes.func,
  users: PropTypes.arrayOf(PropTypes.object),
}

jest.mock('services/users/hooks')
jest.mock('./UserTable', () => MockUserTable)

const users = {
  data: {},
}

describe('UserManagement', () => {
  function setup() {
    act(() => {
      render(<UserManagement provider="gh" owner="chris" />)
    })
  }

  describe('User List', () => {
    describe('with results', () => {
      beforeEach(() => {
        const mockUseUsers = {
          data: {
            results: [
              { username: 'clwiseman', name: 'carrie', activated: true },
            ],
          },
        }
        useUsers.mockReturnValue(mockUseUsers)
        setup()
      })
      it('renders the user list', () => {
        const placeholder = screen.getByText(/UserTable/)
        expect(placeholder).toBeInTheDocument()
      })
    })
    describe('with no results', () => {
      beforeEach(() => {
        const mockUseUsers = {
          data: {},
        }
        useUsers.mockReturnValue(mockUseUsers)
        setup()
      })
      it('does not render the user list', () => {
        const placeholder = screen.queryByText(/UserTable/)
        expect(placeholder).not.toBeInTheDocument()
      })
    })
    describe('activated button', () => {
      beforeEach(() => {
        const mockUseUsers = {
          data: {
            results: [
              { username: 'clwiseman', name: 'carrie', activated: true },
            ],
          },
        }
        useUsers.mockReturnValue(mockUseUsers)

        setup()
      })
      it('renders a button', () => {
        expect(
          screen.getByRole('button', { name: 'Activated' })
        ).toBeInTheDocument()
      })
      it('Activated', () => {
        expect(screen.getByRole('button', { name: 'Activated' })).toContain(
          'Activated'
        )
      })
    })
  })

  describe('Sort By', () => {
    describe('Default Selection', () => {
      beforeEach(() => {
        useUsers.mockReturnValue(users)
        setup()
      })

      it(`Renders the correct selection: Sort by Name ⬆`, () => {
        const SortSelect = screen.getByRole('button', { name: 'sort' })
        userEvent.click(SortSelect)
        expect(
          screen.getByRole('option', { name: /Sort by Name ⬆/ })
        ).toBeInTheDocument()
        userEvent.click(screen.getByRole('option', { name: /Sort by Name ⬆/ }))
        expect(
          screen.queryByRole('option', { name: /Sort by Name ⬆/ })
        ).not.toBeInTheDocument()
      })

      it(`Makes the correct query to the api: Sort by Name ⬆`, () => {
        const SortSelect = screen.getByRole('button', { name: 'sort' })
        userEvent.click(SortSelect)
        userEvent.click(
          screen.getByRole('option', { name: /Sort by Username ⬆/ })
        )
        userEvent.click(SortSelect)
        userEvent.click(screen.getByRole('option', { name: /Sort by Name ⬆/ }))
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: { ordering: 'name' },
        })
      })
    })

    describe.each([
      [/Sort by Name ⬇/, { ordering: '-name' }],
      [/Sort by Username ⬆/, { ordering: 'username' }],
      [/Sort by Username ⬇/, { ordering: '-username' }],
      [/Sort by Email ⬆/, { ordering: 'email' }],
      [/Sort by Email ⬇/, { ordering: '-email' }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        useUsers.mockReturnValue(users)
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'sort' })
        userEvent.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(
          screen.queryByRole('option', { name: label })
        ).not.toBeInTheDocument()
      })

      it(`Makes the correct query to the api: ${label}`, () => {
        expect(useUsers).toHaveBeenCalledTimes(1)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: {},
        })

        const SortSelect = screen.getByRole('button', { name: 'sort' })
        userEvent.click(SortSelect)
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(useUsers).toHaveBeenCalledTimes(2)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: expected,
        })
      })
    })
  })

  describe('Filter by Activated', () => {
    describe.each([
      [/^activated$/, { activated: true }],
      [/^deactivated$/, { activated: false }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        useUsers.mockReturnValue(users)
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'activated' })
        userEvent.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(
          screen.queryByRole('option', { name: label })
        ).not.toBeInTheDocument()
      })

      it(`Makes the correct query to the api: ${label}`, () => {
        expect(useUsers).toHaveBeenCalledTimes(1)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: {},
        })

        const SortSelect = screen.getByRole('button', { name: 'activated' })
        userEvent.click(SortSelect)
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(useUsers).toHaveBeenCalledTimes(2)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: expected,
        })
      })
    })
  })

  describe('Filter by is_admin', () => {
    describe.each([
      [/Is Admin/, { is_admin: true }],
      [/Not Admin/, { is_admin: false }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        useUsers.mockReturnValue(users)
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'admin' })
        userEvent.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(
          screen.queryByRole('option', { name: label })
        ).not.toBeInTheDocument()
      })

      it(`Makes the correct query to the api: ${label}`, () => {
        expect(useUsers).toHaveBeenCalledTimes(1)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: {},
        })

        const SortSelect = screen.getByRole('button', { name: 'admin' })
        userEvent.click(SortSelect)
        userEvent.click(screen.getByRole('option', { name: label }))
        expect(useUsers).toHaveBeenCalledTimes(2)
        expect(useUsers).toHaveBeenCalledWith({
          owner: 'chris',
          provider: 'gh',
          query: expected,
        })
      })
    })
  })

  describe('Search', () => {
    beforeEach(() => {
      useUsers.mockReturnValue(users)
      setup()
      return act(async () => {
        const SearchInput = screen.getByRole('textbox', {
          name: 'search users',
        })
        const Submit = screen.getByRole('button', { name: 'Submit' })

        userEvent.type(SearchInput, 'Ter')
        userEvent.click(Submit, { bubbles: true })
      })
    })

    it('Makes the correct query to the api', () => {
      expect(useUsers).toHaveBeenCalledWith({
        owner: 'chris',
        provider: 'gh',
        query: { ordering: 'name', search: 'Ter' },
      })
    })
  })
})
