import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'

import { useUsers, useUpdateUser } from 'services/users'
import { useAccountDetails, useAutoActivate } from 'services/account'

import UserManagerment from './UserManagement'

jest.mock('services/users/hooks')
jest.mock('services/account/hooks')

const queryClient = new QueryClient()

const users = {
  data: {
    totalPages: 1,
    results: [],
  },
}

const account = {
  data: {
    planAutoActivate: true,
    activatedUserCount: 1,
  },
}

const updateUserMutate = jest.fn()
const updateUser = {
  mutate: updateUserMutate,
}

const updateAccountMutate = jest.fn()
const updateAccount = {
  mutate: updateAccountMutate,
}

const defaultQuery = {
  activated: '',
  isAdmin: '',
  ordering: 'name',
  search: '',
  page: 1,
  pageSize: 50,
}

describe('UserManagerment', () => {
  function setup({
    mockUseUsersValue = users,
    mockUseUpdateUserValue = updateUser,
    mockUseUsersImplementation,
    mockUseAccountDetails = account,
    mockUseAutoActivate = updateAccount,
  } = {}) {
    useUpdateUser.mockReturnValue(mockUseUpdateUserValue)
    useAccountDetails.mockReturnValue(mockUseAccountDetails)
    useAutoActivate.mockReturnValue(mockUseAutoActivate)

    if (mockUseUsersImplementation) {
      useUsers.mockImplementation(mockUseUsersImplementation)
    } else {
      useUsers.mockReturnValue(mockUseUsersValue)
    }

    render(<UserManagerment provider="gh" owner="radient" />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    })
  }

  describe('User List', () => {
    describe('renders results', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
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
            totalPages: 1,
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
            totalPages: 1,
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
            totalPages: 1,
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
            totalPages: 1,
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
  })

  describe('Filter by Activated', () => {
    describe.each([
      [/All users/, defaultQuery],
      [/Active users/, { ...defaultQuery, activated: 'True' }],
      [/In-active users/, { ...defaultQuery, activated: 'False' }],
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
      [/Everyone/, defaultQuery],
      [/Admins/, { ...defaultQuery, isAdmin: 'True' }],
      [/Collaborators/, { ...defaultQuery, isAdmin: 'False' }],
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
          totalPages: 1,
          results: [
            { username: 'earthspirit', avatarUrl: '' },
            { username: 'dazzle', avatarUrl: '' },
          ].filter(({ username }) => {
            // mock query search
            if (query.search) return username.includes(query.search)
            return true
          }),
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

    it('Search users on enter', () => {
      const SearchInput = screen.getByRole('textbox', {
        name: 'search users',
      })
      expect(useUsers).toHaveBeenCalledTimes(1)
      user.type(SearchInput, 'd')
      user.type(SearchInput, '{enter}')
      expect(useUsers).toHaveBeenCalledTimes(3)
      expect(useUsers).toHaveBeenLastCalledWith({
        owner: 'radient',
        provider: 'gh',
        query: { ...defaultQuery, search: 'd' },
      })
    })
  })

  describe('Activate user with less than 5 activated users', () => {
    let mutateMock = jest.fn()

    beforeEach(() => {
      const mockUseUpdateUserValue = {
        mutate: mutateMock,
      }
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          totalPages: 1,
          results: [
            {
              ownerid: 10,
              activated: false,
              username: 'test',
              avatarUrl: '',
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
        targetUserOwnerid: 10,
        activated: true,
      })
    })
  })

  describe('Activate user with more than 5 activated users', () => {
    let mutateMock = jest.fn()

    beforeEach(() => {
      const mockUseUpdateUserValue = {
        mutate: mutateMock,
      }
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          totalPages: 1,
          results: [
            {
              ownerid: 10,
              activated: true,
              username: 'test',
              avatarUrl: '',
            },
            {
              ownerid: 11,
              activated: true,
              username: 'test-11',
              avatarUrl: '',
            },
            {
              ownerid: 12,
              activated: true,
              username: 'test-12',
              avatarUrl: '',
            },
            {
              ownerid: 13,
              activated: true,
              username: 'test-13',
              avatarUrl: '',
            },
            {
              ownerid: 14,
              activated: true,
              username: 'test-14',
              avatarUrl: '',
            },
            {
              ownerid: 15,
              activated: true,
              username: 'test-15',
              avatarUrl: '',
            },
            {
              ownerid: 16,
              activated: true,
              username: 'test-16',
              avatarUrl: '',
            },
            {
              ownerid: 17,
              activated: false,
              username: 'test-17',
              avatarUrl: '',
            },
          ],
        },
      }
      const mockUseAccountDetails = {
        data: {
          planAutoActivate: true,
          activatedUserCount: 6,
        },
      }

      setup({
        mockUseUsersValue,
        mockUseUpdateUserValue,
        mockUseAccountDetails,
      })
    })

    it('Clicking "Activate" opens up the modal', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activate',
      })
      user.click(ActivateBtn)
      const modalTitle = screen.getByRole('heading', {
        name: 'Upgrade to Pro',
      })
      expect(modalTitle).toBeInTheDocument()
    })

    it('Clicking "x" svg will close up the modal', () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activate',
      })
      user.click(ActivateBtn)
      const xModalButton = screen.getByText('x.svg')
      expect(xModalButton).toBeInTheDocument()
      user.click(xModalButton)
      expect(
        screen.queryByRole('heading', {
          name: 'Upgrade to Pro',
        })
      ).not.toBeInTheDocument()
    })

    it('Clicking "close" button will close up the modal', () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activate',
      })
      user.click(ActivateBtn)
      const cancelButton = screen.getByRole('button', {
        name: 'Cancel',
      })
      expect(cancelButton).toBeInTheDocument()
      user.click(cancelButton)
      expect(
        screen.queryByRole('heading', {
          name: 'Upgrade to Pro',
        })
      ).not.toBeInTheDocument()
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
          totalPages: 1,
          results: [
            {
              ownerid: 11,
              activated: true,
              username: 'test',
              avatarUrl: '',
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
        targetUserOwnerid: 11,
        activated: false,
      })
    })
  })

  describe('Pagination Controls', () => {
    describe('On page change', () => {
      beforeEach(() => {
        const mockUseUsersImplementation = ({ query }) => {
          const dazzle = { username: 'dazzle', avatarUrl: '' }
          const es = { username: 'earthspirit', avatarUrl: '' }
          return {
            isSuccess: true,
            data: {
              totalPages: 10,
              results: query.page === 1 ? [dazzle] : [es],
            },
          }
        }

        setup({ mockUseUsersImplementation })
      })

      it('Clicking a page updates the query page', async () => {
        expect(screen.getByText(/dazzle$/)).toBeInTheDocument()
        const Page2 = screen.getByRole('button', {
          name: /2/,
        })
        user.click(Page2)
        await waitFor(() =>
          expect(expect(screen.getByText(/earthspirit$/)).toBeInTheDocument())
        )
      })
    })
    describe('If only one page', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
            results: [],
          },
        }
        setup({ mockUseUsersValue })
      })

      it('Does not render', async () => {
        const Page1 = screen.queryByRole('button', {
          name: /1/,
        })

        expect(Page1).not.toBeInTheDocument()
      })
    })
  })

  describe('Auto Activate Toggle', () => {
    describe('On change', () => {
      beforeEach(() => {
        jest.resetAllMocks()
        setup()
      })

      it('Clicking triggers a change', async () => {
        const toggle = screen.getByText(/Auto activate users/)
        user.click(toggle)
        await waitFor(() =>
          expect(updateAccountMutate).toHaveBeenCalledTimes(1)
        )
      })
    })
  })
})
