import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
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

const defaultQuery = {
  activated: '',
  isAdmin: '',
  ordering: 'name',
  search: '',
}

function assertFromToday(date) {
  // Due to last seen/past pr being based on the current date
  // we need to asset the expected date format is rendered vs hard coding the expect.
  return formatDistance(parseISO(date), new Date(), 'MM/dd/yyyy')
}

xdescribe('UserManagerment', () => {
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

    render(<UserManagerment provider="gh" owner="radient" />, {
      wrapper: MemoryRouter,
    })
  }

  describe('Shows fetching status', () => {
    beforeEach(() => {
      const mockUseUsersValue = {
        isFetching: true,
      }
      setup({ mockUseUsersValue })
    })
    it('shows fetching', () => {
      expect(screen.getByText(/Fetching/)).toBeInTheDocument()
    })
  })

  describe('User List', () => {
    describe('renders results', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            results: [
              {
                username: 'earthspirit',
                name: 'Earth Spitir',
                activated: true,
              },
            ],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders the user list', () => {
        const placeholder = screen.getByText(/@earthspirit/)
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
            results: [{ username: 'dazzle', student: true }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders if student user', () => {
        const placeholder = screen.getByText(/dazzle$/)
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
            results: [{ username: 'dazzle', isAdmin: true }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders if admin user', () => {
        const placeholder = screen.getByText(/dazzle$/)
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
            results: [{ username: 'dazzle', email: 'dazzle@dota.com' }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('renders an email', () => {
        const placeholder = screen.getByText(/dazzle$/)
        expect(placeholder).toBeInTheDocument()

        const studentLabel = screen.getByText(/dazzle@dota.com/)
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
        user.click(screen.getByRole('option', { name: /Sort by Username ⬇/ }))

        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: /Sort by Name ⬆/ }))

        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: defaultQuery,
        })
      })
    })

    describe.each([
      [/Sort by Name ⬇/, { ...defaultQuery, ordering: '-name' }],
      [/Sort by Username ⬆/, { ...defaultQuery, ordering: 'username' }],
      [/Sort by Username ⬇/, { ...defaultQuery, ordering: '-username' }],
      [/Sort by Email ⬆/, { ...defaultQuery, ordering: 'email' }],
      [/Sort by Email ⬇/, { ...defaultQuery, ordering: '-email' }],
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
        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: defaultQuery,
        })

        const SortSelect = screen.getByRole('button', { name: 'ordering' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))

        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: expected,
        })
      })
    })
  })

  describe('Filter by Activated', () => {
    describe.each([
      [/Filter By Activated Users/, defaultQuery],
      [/^activated$/, { ...defaultQuery, activated: 'True' }],
      [/^deactivated$/, { ...defaultQuery, activated: 'False' }],
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
        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: defaultQuery,
        })

        const SortSelect = screen.getByRole('button', { name: 'activated' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))

        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: expected,
        })
      })
    })
  })

  describe('Filter by is_Admin', () => {
    describe.each([
      [/Filter By Admin/, defaultQuery],
      [/Is Admin/, { ...defaultQuery, isAdmin: 'True' }],
      [/Not Admin/, { ...defaultQuery, isAdmin: 'False' }],
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
        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
          provider: 'gh',
          query: defaultQuery,
        })

        const SortSelect = screen.getByRole('button', { name: 'isAdmin' })
        user.click(SortSelect)
        user.click(screen.getByRole('option', { name: label }))

        expect(useUsers).toHaveBeenLastCalledWith({
          owner: 'radient',
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
          results: [{ username: 'earthspirit' }, { username: 'dazzle' }].filter(
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

    it('Makes the correct query to the api', () => {
      const SearchInput = screen.getByRole('textbox', {
        name: 'search users',
      })
      expect(useUsers).toHaveBeenCalledTimes(1)

      user.type(SearchInput, 'd')

      expect(useUsers).toHaveBeenCalledTimes(2)
      expect(useUsers).toHaveBeenLastCalledWith({
        owner: 'radient',
        provider: 'gh',
        query: { ...defaultQuery, search: 'd' },
      })
    })

    it('Only renders current matching users', () => {
      const SearchInput = screen.getByRole('textbox', {
        name: 'search users',
      })

      expect(screen.getByText(/earthspirit$/)).toBeInTheDocument()

      user.type(SearchInput, 'd')

      expect(screen.queryByText(/earthspirit$/)).not.toBeInTheDocument()
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
      expect(mutateMock).toHaveBeenLastCalledWith({
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
      expect(mutateMock).toHaveBeenLastCalledWith({
        targetUser: 'kumar',
        activated: false,
      })
    })
  })
})
