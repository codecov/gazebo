import { render, screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'
import formatDistance from 'date-fns/formatDistance'
import parseISO from 'date-fns/parseISO'

import { useUsers, useUpdateUser } from 'services/users'
import { useAccountDetails, useAutoActivate } from 'services/account'

import UserManagerment from './UserManagement'

jest.mock('services/users/hooks')
jest.mock('services/account/hooks')

const queryClient = new QueryClient()

const users = {
  data: {
    totalPages: 1,
  },
}

const account = {
  data: { planAutoActivate: true },
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

    describe('Last seen', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
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
      it('takes precedence over last PR', () => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
            results: [
              {
                username: 'kumar',
                lastseen: '2021-01-20T05:03:51Z',
                latestPrivatePrDate: '2021-03-20T05:02:56Z',
              },
            ],
          },
        }
        setup({ mockUseUsersValue })

        const lastSeen = screen.getByText(
          assertFromToday('2021-03-20T05:02:56Z')
        )
        expect(lastSeen).toBeInTheDocument()
      })
    })

    describe('No last seen', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
            results: [{ username: 'kumar' }],
          },
        }
        setup({ mockUseUsersValue })
      })
      it('not rendered', () => {
        const placeholder = screen.getByText(/kumar/)
        expect(placeholder).toBeInTheDocument()

        const lastSeen = screen.queryByTestId('last-seen')
        expect(lastSeen).not.toBeInTheDocument()
      })
    })

    describe('Last pr', () => {
      beforeEach(() => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
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
      it('takes precedence over lastseen', () => {
        const mockUseUsersValue = {
          isSuccess: true,
          data: {
            totalPages: 1,
            results: [
              {
                username: 'kumar',
                latestPrivatePrDate: '2021-03-20T05:03:56Z',
                lastseen: '2021-01-20T05:02:56Z',
              },
            ],
          },
        }
        setup({ mockUseUsersValue })
        const lastPr = screen.getByText(assertFromToday('2021-03-20T05:03:56Z'))
        expect(lastPr).toBeInTheDocument()
      })
    })
  })

  describe('No last pr', () => {
    beforeEach(() => {
      const mockUseUsersValue = {
        isSuccess: true,
        data: {
          totalPages: 1,
          results: [{ username: 'kumar' }],
        },
      }
      setup({ mockUseUsersValue })
    })
    it('not rendered', () => {
      const placeholder = screen.getByText(/kumar/)
      expect(placeholder).toBeInTheDocument()

      const lastPr = screen.queryByTestId('last-pr')
      expect(lastPr).not.toBeInTheDocument()
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

  describe('Activate user', () => {
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
          totalPages: 1,
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

  describe('Pagination Controls', () => {
    describe('On page change', () => {
      beforeEach(() => {
        const mockUseUsersImplementation = ({ query }) => {
          const dazzle = { username: 'dazzle' }
          const es = { username: 'earthspirit' }
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
