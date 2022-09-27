import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import user from '@testing-library/user-event'
import { MemoryRouter, useParams } from 'react-router-dom'

import { useAccountDetails, useAutoActivate } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useUpdateUser, useUsers } from 'services/users'

import MembersList from './MembersList'

jest.mock('services/users')
jest.mock('services/account')
jest.mock('services/user')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain the original functionalities
  useParams: jest.fn(() => {}),
}))

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
    plan: {
      value: 'users-free',
    },
  },
}

const enterpriseAccountDetails = {
  data: {
    planAutoActivate: true,
    activatedUserCount: 1,
    plan: {
      value: 'users-enterprisey',
    },
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
  ordering: '-name',
  search: '',
  page: 1,
  pageSize: 50,
}

const mockUserData = {
  data: {
    user: {
      username: 'rula',
    },
  },
}

describe('MembersList', () => {
  function setup({
    mockUseUsersValue = users,
    mockUseUpdateUserValue = updateUser,
    mockUseUsersImplementation,
    mockUseAccountDetails = account,
    mockUseAutoActivate = updateAccount,
    isAdmin,
  }) {
    useParams.mockReturnValue({ owner: 'radient', provider: 'gh' })
    useUpdateUser.mockReturnValue(mockUseUpdateUserValue)
    useAccountDetails.mockReturnValue(mockUseAccountDetails)
    useAutoActivate.mockReturnValue(mockUseAutoActivate)
    useUser.mockReturnValue(mockUserData)
    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)

    if (mockUseUsersImplementation) {
      useUsers.mockImplementation(mockUseUsersImplementation)
    } else {
      useUsers.mockReturnValue(mockUseUsersValue)
    }

    render(<MembersList provider="gh" owner="radient" />, {
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
        setup({ mockUseUsersValue, isAdmin: true })
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
        setup({ mockUseUsersValue, isAdmin: true })
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
        setup({ mockUseUsersValue, isAdmin: true })
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
        setup({ mockUseUsersValue, isAdmin: true })
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
        setup({ mockUseUsersValue, isAdmin: true })
      })
      it('renders an email', () => {
        const placeholder = screen.getByText(/dazzle$/)
        expect(placeholder).toBeInTheDocument()

        const studentLabel = screen.getByText(/dazzle@dota.com/)
        expect(studentLabel).toBeInTheDocument()
      })
    })
  })

  describe('Enterprise plan shows members last pull timestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-07-18 15:18:17.290'))

      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          totalPages: 1,
          results: [
            {
              username: 'dazzle',
              email: 'dazzle@dota.com',
              lastPullTimestamp: '2022-06-17 15:18:17.290',
            },
          ],
        },
      }
      setup({
        mockUseUsersValue,
        mockUseAccountDetails: enterpriseAccountDetails,
      })
    })
    it('renders an email', () => {
      const placeholder = screen.getByText(/dazzle$/)
      expect(placeholder).toBeInTheDocument()

      const studentLabel = screen.getByText(/dazzle@dota.com/)
      expect(studentLabel).toBeInTheDocument()

      const lastPullTimestamp = screen.getByText(/last PR: about 1 month ago/)
      expect(lastPullTimestamp).toBeInTheDocument()
    })
  })

  describe('Filter by Activated', () => {
    describe.each([
      [/All users/, defaultQuery],
      [/Active users/, { ...defaultQuery, activated: 'True' }],
      [/Inactive users/, { ...defaultQuery, activated: 'False' }],
    ])('All others', (label, expected) => {
      beforeEach(() => {
        setup({ isAdmin: true })
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
        setup({ isAdmin: true })
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

  describe('Enterprise plan shows ordering select', () => {
    beforeEach(() => {
      setup({ mockUseAccountDetails: enterpriseAccountDetails })
    })

    it('Renders ordering select with the default selection', () => {
      const OrderSelect = screen.getByRole('button', { name: 'ordering' })
      expect(OrderSelect).toBeInTheDocument()
      expect(screen.getByText('Name A-Z')).toBeInTheDocument()
    })

    it('Handles options selection', () => {
      const SortSelect = screen.getByRole('button', { name: 'ordering' })
      user.click(SortSelect)
      const asc = screen.getByRole('option', { name: 'Oldest PR' })
      expect(asc).toBeInTheDocument()
      user.click(asc)
      expect(
        screen.queryByRole('option', { name: 'Oldest PR' })
      ).not.toBeInTheDocument()
    })

    it('Makes the correct query to the api: Oldest PR', () => {
      expect(useUsers).toHaveBeenLastCalledWith({
        owner: 'radient',
        provider: 'gh',
        query: defaultQuery,
      })

      const SortSelect = screen.getByRole('button', { name: 'ordering' })
      user.click(SortSelect)
      user.click(screen.getByRole('option', { name: 'Oldest PR' }))

      expect(useUsers).toHaveBeenLastCalledWith({
        owner: 'radient',
        provider: 'gh',
        query: {
          activated: '',
          isAdmin: '',
          ordering: 'last_pull_timestamp',
          page: 1,
          pageSize: 50,
          search: '',
        },
      })
    })
  })

  describe('Ordering select and last PR pill are hidden for any plan but enterprise', () => {
    beforeEach(() => {
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          totalPages: 1,
          results: [
            {
              username: 'dazzle',
              email: 'dazzle@dota.com',
              lastPullTimestamp: '', //we don't have last pull time stamp in DB for non enterprise users
            },
          ],
        },
      }
      setup({ mockUseUsersValue })
    })

    it('Does not render ordering select', () => {
      const OrderSelect = screen.queryByRole('button', { name: 'ordering' })
      expect(OrderSelect).not.toBeInTheDocument()
    })

    it('Does not render last pr pill', () => {
      const lastPullTimestamp = screen.queryByText(/last PR: about 1 month ago/)
      expect(lastPullTimestamp).not.toBeInTheDocument()
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
      setup({ mockUseUsersImplementation, isAdmin: true })
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

      setup({ mockUseUsersValue, mockUseUpdateUserValue, isAdmin: true })
    })

    it('Renders a inactive user with activate toggle', () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Not yet activated',
      })
      expect(ActivateBtn).toBeInTheDocument()
    })

    it('Switching the toggle activates a user', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Not yet activated',
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
          plan: {
            value: 'users-free',
          },
        },
      }

      setup({
        mockUseUsersValue,
        mockUseUpdateUserValue,
        mockUseAccountDetails,
        isAdmin: true,
      })
    })

    it('Switching the toggle to "Activate" opens up the modal', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Not yet activated',
      })
      user.click(ActivateBtn)
      const modalTitle = screen.getByRole('heading', {
        name: 'Upgrade to Pro',
      })
      expect(modalTitle).toBeInTheDocument()
    })

    it('Clicking "x" svg will close up the modal', () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Not yet activated',
      })
      user.click(ActivateBtn)
      const xModalButton = screen.getAllByText('x.svg')[1]
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
        name: 'Not yet activated',
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

  describe('Activate user with more than 5 activated users and non-free tier', () => {
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
              activated: false,
              username: 'test-16',
              avatarUrl: '',
            },
          ],
        },
      }
      const mockUseAccountDetails = {
        data: {
          planAutoActivate: true,
          activatedUserCount: 6,
          plan: {
            value: 'users-inappy',
          },
        },
      }

      setup({
        mockUseUsersValue,
        mockUseUpdateUserValue,
        mockUseAccountDetails,
        isAdmin: true,
      })
    })

    it('Switching the toggle to "Activate" still activates a new user', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Not yet activated',
      })
      user.click(ActivateBtn)
      await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1))
      expect(mutateMock).toHaveBeenLastCalledWith({
        targetUserOwnerid: 16,
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

      setup({ mockUseUsersValue, mockUseUpdateUserValue, isAdmin: true })
    })

    it('Renders a active user with a deactivate toggle', () => {
      const DeactivateBtn = screen.getByRole('button', {
        name: 'Activated',
      })
      expect(DeactivateBtn).toBeInTheDocument()
    })

    it('Switching the toggle deactivates a user', async () => {
      const ActivateBtn = screen.getByRole('button', {
        name: 'Activated',
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

        setup({ mockUseUsersImplementation, isAdmin: true })
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
        setup({ mockUseUsersValue, isAdmin: true })
      })

      it('Does not render', async () => {
        const Page1 = screen.queryByRole('button', {
          name: /1/,
        })

        expect(Page1).not.toBeInTheDocument()
      })
    })
  })
})
