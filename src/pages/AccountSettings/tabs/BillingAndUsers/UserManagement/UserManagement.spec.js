import {
  render,
  screen,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react'
import user from '@testing-library/user-event'
import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

import { useUsers, useUpdateUser } from 'services/users'

import UserManagerment from './UserManagement'

jest.mock('services/users/hooks')

const users = {
  data: {},
}

const updateUser = {
  mutate: jest.fn(),
}

function assertFromToday(date) {
  // Due to last seen/past pr being based on the current date
  // we need to asset the expected date format is rendered vs hard coding the expect.
  return formatDistance(parseISO(date), new Date(), 'MM/dd/yyyy')
}

describe('UserManagerment', () => {
  function setup({
    mockUseUsersValue = users,
    mockUseUpdateUserValue = updateUser,
    mockUseUsersImplementation,
  } = {}) {
    useUpdateUser.mockReturnValue(mockUseUpdateUserValue)

    if (mockUseUsersImplementation) {
      useUsers.mockImplementation(mockUseUsersImplementation)
    } else {
      useUsers.mockReturnValue(mockUseUsersValue)
    }

    render(<UserManagerment provider="gh" owner="chris" />)
  }

  describe('User List', () => {
    describe('renders results', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [
              { username: 'clwiseman', name: 'carrie', activated: true },
            ],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders the user list', () => {
        const placeholder = screen.getByText(/@clwiseman/)
        expect(placeholder).toBeInTheDocument()

        const Avatar = screen.getAllByRole('img')
        expect(Avatar.length).toBe(1)
      })
    })
    describe('renders nothing with no results', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders the user list', () => {
        const Avatar = screen.queryAllByRole('img')
        expect(Avatar.length).toBe(0)
      })
    })
  })

  describe('User rendering', () => {
    describe('is student', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [{ username: 'kumar', student: true }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders if student user', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const studentLabel = screen.getByText(/Student/)
        expect(studentLabel).toBeInTheDocument()
      })
    })

    describe('is admin', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [{ username: 'kumar', isAdmin: true }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders if admin user', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const studentLabel = screen.getByText(/^Admin/)
        expect(studentLabel).toBeInTheDocument()
      })
    })

    describe('is email', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [{ username: 'kumar', email: 'test@email.com' }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders an email', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const studentLabel = screen.getByText(/test@email.com/)
        expect(studentLabel).toBeInTheDocument()
      })
    })

    describe('Last seen', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [{ username: 'kumar', lastseen: '2021-01-20T05:03:56Z' }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders correct date', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const lastSeen = screen.getByText(
          assertFromToday('2021-01-20T05:03:56Z')
        )
        expect(lastSeen).toBeInTheDocument()
      })
    })

    describe('No last seen', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [{ username: 'kumar' }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders never seen', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const lastSeen = screen.getByTestId('last-seen')
        expect(lastSeen).toBeInTheDocument()
      })
    })

    describe('Last pr', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [
              {
                username: 'kumar',
                latestPrivatePrDate: '2021-01-20T05:03:56Z',
              },
            ],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders correct date', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const lastPr = screen.getByText(assertFromToday('2021-01-20T05:03:56Z'))
        expect(lastPr).toBeInTheDocument()
      })
    })
  })

  describe('No last pr', () => {
    beforeEach(() => {
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          results: [{ username: 'kumar' }],
        },
      }
      setup({ mockUseUsersValue })
    })
    it('renders never seen', () => {
      const placeholder = screen.getByText(/kumar/)
      expect(placeholder).toBeInTheDocument()

      const lastPr = screen.getByTestId('last-pr')
      expect(lastPr).toBeInTheDocument()
    })
  })

  describe('Sort By', () => {
    describe('Default Selection', () => {
      beforeEach(() => {
        setup()
      })

      it(`Renders the correct selection: Sort by Name ⬆`, () => {
        const SortSelect = screen.getByRole('button', { name: 'ordering' })
        user.click(SortSelect)
        expect(
          screen.getByRole('option', { name: /Sort by Name ⬆/ })
        ).toBeInTheDocument()
        user.click(screen.getByRole('option', { name: /Sort by Name ⬆/ }))
        expect(
          screen.queryByRole('option', { name: /Sort by Name ⬆/ })
        ).not.toBeInTheDocument()
      })

      it(`Makes the correct query to the api: Sort by Name ⬆`, () => {
        const SortSelect = screen.getByRole('button', { name: 'ordering' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: /Sort by Username ⬆/ }))
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: /Sort by Name ⬆/ }))
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
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'ordering' })
        user.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        user.click(screen.getByRole('option', { name: label }))
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

        const SortSelect = screen.getByRole('button', { name: 'ordering' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))
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
      [/^activated$/, { activated: 'True' }],
      [/^deactivated$/, { activated: 'False' }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'activated' })
        user.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        user.click(screen.getByRole('option', { name: label }))
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
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))
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
      [/Is Admin/, { is_admin: 'True' }],
      [/Not Admin/, { is_admin: 'False' }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        setup()
      })

      it(`Renders the correct selection: ${label}`, () => {
        const SortSelect = screen.getByRole('button', { name: 'isAdmin' })
        user.click(SortSelect)
        expect(screen.getByRole('option', { name: label })).toBeInTheDocument()
        user.click(screen.getByRole('option', { name: label }))
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

        const SortSelect = screen.getByRole('button', { name: 'isAdmin' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))
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
      const mockUseUsersImplementation = ({ query }) => ({
        isSuccess: true,
        data: {
          results: [{ username: 'kumar' }, { username: 'terry' }].filter(
            ({ username }) => {
              // mock query search
              if (query.search) return username.includes(query.search)
              return true
            }
          ),
        },
      })
      setup({ mockUseUsersImplementation })
    })

    it('Makes the correct query to the api', async () => {
      const SearchInput = screen.getByRole('textbox', {
        name: 'search users',
      })
      const Submit = screen.getByRole('button', { name: 'Submit' })

      await user.type(SearchInput, 'Ter')
      user.click(Submit)
      await waitForElementToBeRemoved(() => screen.getByText(/kumar/))

      expect(useUsers).toHaveBeenCalledWith({
        owner: 'chris',
        provider: 'gh',
        query: { ordering: 'name', activated: '', is_admin: '', search: 'Ter' },
      })
    })
  })

  describe('Activate user', () => {
    let mutateMock = jest.fn()

    beforeEach(() => {
      const mockUseUpdateUserValue = {
        mutate: mutateMock,
      }
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          results: [
            {
              username: 'kumar',
              activated: false,
            },
          ],
        },
      }

      setup({ mockUseUsersValue, mockUseUpdateUserValue })
    })

    it('Renders a inactive user with a Activate button', () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activate',
      })
      expect(ActivateBtn).toBeInTheDocument()
    })

    it('Clicking "Activate" activates a user', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activate',
      })
      user.click(ActivateBtn)
      await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
      expect(mutateMock).toHaveBeenCalledWith({
        targetUser: 'kumar',
        activated: true,
      })
    })
  })

  describe('Deactivate user', () => {
    let mutateMock = jest.fn()

    beforeEach(() => {
      const mockUseUpdateUserValue = {
        mutate: mutateMock,
      }
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          results: [
            {
              username: 'kumar',
              activated: true,
            },
          ],
        },
      }

      setup({ mockUseUsersValue, mockUseUpdateUserValue })
    })

    it('Renders a inactive user with a Deactivate button', () => {
      const DeactivateBtn = screen.getByRole('button', {
        name: 'Deactivate',
      })
      expect(DeactivateBtn).toBeInTheDocument()
    })

    it('Clicking "Deactivate" activates a user', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Deactivate',
      })
      user.click(ActivateBtn)
      await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
      expect(mutateMock).toHaveBeenCalledWith({
        targetUser: 'kumar',
        activated: false,
      })
    })
  })
})
