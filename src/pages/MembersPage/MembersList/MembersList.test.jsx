import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import 'react-intersection-observer/test-utils'

import { Plans } from 'shared/utils/billing'

import MembersList from './MembersList'

const mockNonActiveUserRequest = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      activated: false,
      is_admin: false,
      username: 'codecov-user',
      email: 'user@codecov.io',
      ownerid: 1,
      student: false,
      name: 'codecov',
      last_pull_timestamp: null,
    },
  ],
  total_pages: 1,
}

const mockActiveUserRequest = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      activated: true,
      is_admin: false,
      username: 'codecov-user',
      email: 'user@codecov.io',
      ownerid: 1,
      student: false,
      name: 'codecov',
      last_pull_timestamp: null,
    },
  ],
  total_pages: 1,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('MembersList', () => {
  let testLocation

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">{children}</Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

  function setup({ accountDetails = {} } = { accountDetails: {} }) {
    const user = userEvent.setup()
    const mockActivateUser = vi.fn()

    let sendActivatedUser = false

    server.use(
      http.get('/internal/:provider/codecov/account-details', () => {
        return HttpResponse.json(accountDetails)
      }),
      http.get('/internal/:provider/codecov/users', () => {
        if (sendActivatedUser) {
          sendActivatedUser = false
          return HttpResponse.json(mockActiveUserRequest)
        }
        return HttpResponse.json(mockNonActiveUserRequest)
      }),
      http.patch('/internal/:provider/codecov/users/:ownerid', () => {
        sendActivatedUser = true
        mockActivateUser()
        return HttpResponse.json({})
      })
    )

    return { user, mockActivateUser }
  }

  describe('rendering MembersList', () => {
    beforeEach(() => setup())

    it('does not render UpgradeModal', () => {
      render(<MembersList />, { wrapper })

      const modal = screen.queryByText('UpgradeModal')
      expect(modal).not.toBeInTheDocument()
    })

    it('renders status selector', async () => {
      render(<MembersList />, { wrapper })

      const selector = await screen.findByText('All users')
      expect(selector).toBeInTheDocument()
    })

    it('renders role selector', async () => {
      render(<MembersList />, { wrapper })

      const selector = await screen.findByText('Everyone')
      expect(selector).toBeInTheDocument()
    })

    it('renders search text field', async () => {
      render(<MembersList />, { wrapper })

      const textfield = await screen.findByTestId('search-input-members')
      expect(textfield).toBeInTheDocument()
    })

    it('renders MembersTable', async () => {
      render(<MembersList />, { wrapper })

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const tableHeader = await screen.findByText('Username')
      expect(tableHeader).toBeInTheDocument()

      const tableEntry = await screen.findByText('codecov')
      expect(tableEntry).toBeInTheDocument()
    })
  })

  describe('interacting with the status selector', () => {
    describe('selecting Active Users', () => {
      it('updates select text', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        await user.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Active users',
        })
        await user.click(selectActive)

        const activeUsers = await screen.findByText('Active users')
        expect(activeUsers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        await user.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Active users',
        })
        await user.click(selectActive)

        await waitFor(() => expect(testLocation.search).toBe('?activated=True'))
      })
    })

    describe('selecting Inactive Users', () => {
      it('updates select text', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        await user.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Inactive users',
        })
        await user.click(selectActive)

        const inactiveUsers = await screen.findByText('Inactive users')
        expect(inactiveUsers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        await user.click(select)

        const selectInactive = await screen.findByRole('option', {
          name: 'Inactive users',
        })
        await user.click(selectInactive)

        await waitFor(() =>
          expect(testLocation.search).toBe('?activated=False')
        )
      })
    })
  })

  describe('interacting with the search field', () => {
    describe('user types into search field', () => {
      it('updates url params', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const searchField = await screen.findByTestId('search-input-members')
        await user.type(searchField, 'codecov')

        await waitFor(() => expect(testLocation.search).toBe('?search=codecov'))
      })
    })
  })

  describe('interacting with the role selector', () => {
    describe('selecting Admins Users', () => {
      it('updates select text', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('Everyone')
        await user.click(select)

        const selectAdmins = await screen.findByRole('option', {
          name: 'Admins',
        })
        await user.click(selectAdmins)

        const admins = await screen.findByText('Admins')
        expect(admins).toBeInTheDocument()
      })

      it('updates query params', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        await user.click(select)

        const selectAdmins = screen.getByText('Admins')
        await user.click(selectAdmins)

        await waitFor(() => expect(testLocation.search).toBe('?isAdmin=True'))
      })
    })

    describe('selecting Developers', () => {
      it('updates select text', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('Everyone')
        await user.click(select)

        const selectDevelopers = await screen.findByText('Developers')
        await user.click(selectDevelopers)

        const developers = await screen.findByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        const { user } = setup()
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        await user.click(select)

        const selectDevelopers = screen.getByText('Developers')
        await user.click(selectDevelopers)

        await waitFor(() => expect(testLocation.search).toBe('?isAdmin=False'))
      })
    })
  })

  describe('interacting with user toggles', () => {
    describe('user is on a free plan', () => {
      describe('activated seats is greater then or equal to plan quantity', () => {
        it('opens up upgrade modal', async () => {
          const { user } = setup({
            accountDetails: {
              activatedUserCount: 100,
              plan: { value: Plans.USERS_BASIC, quantity: 1 },
            },
          })

          render(<MembersList />, { wrapper })

          await waitFor(() =>
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
          )

          const tableHeader = await screen.findByText('Username')
          expect(tableHeader).toBeInTheDocument()

          const toggle = await screen.findByLabelText('Non-Active')
          expect(toggle).toBeInTheDocument()
          await user.click(toggle)

          const modalHeader = await screen.findByText('Upgrade to Pro')
          expect(modalHeader).toBeInTheDocument()
        })
      })

      describe('activated seats is less then or equal to plan quantity', () => {
        it('does not open upgrade modal', async () => {
          const { user } = setup({
            accountDetails: {
              activatedUserCount: 0,
              plan: { value: Plans.USERS_BASIC, quantity: 1 },
            },
          })
          render(<MembersList />, { wrapper })

          await waitFor(() =>
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
          )

          const tableHeader = await screen.findByText('Username')
          expect(tableHeader).toBeInTheDocument()

          const toggle = await screen.findByLabelText('Non-Active')
          expect(toggle).toBeInTheDocument()
          await user.click(toggle)

          await waitFor(() =>
            expect(
              screen.queryByLabelText('Non-Active')
            ).not.toBeInTheDocument()
          )

          const activeToggle = await screen.findByText('Activated')
          expect(activeToggle).toBeInTheDocument()
        })
      })
    })

    describe('user is not on a free plan', () => {
      describe('activated seats is greater then or equal to plan quantity', () => {
        it('renders disabled toggle', async () => {
          setup({
            accountDetails: {
              activatedUserCount: 100,
              plan: { value: Plans.USERS_PR_INAPPY, quantity: 1 },
            },
          })

          render(<MembersList />, { wrapper })

          await waitFor(() =>
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
          )

          const tableHeader = await screen.findByText('Username')
          expect(tableHeader).toBeInTheDocument()

          const toggle = await screen.findByLabelText('Non-Active')
          expect(toggle).toBeInTheDocument()
          expect(toggle).toBeDisabled()
        })
      })

      describe('activated seats is less then or equal to plan quantity', () => {
        it('calls activate user', async () => {
          const { user, mockActivateUser } = setup({
            accountDetails: {
              activatedUserCount: 0,
              plan: { value: Plans.USERS_PR_INAPPY, quantity: 1 },
            },
          })
          render(<MembersList />, { wrapper })

          await waitFor(() =>
            expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
          )

          const tableHeader = await screen.findByText('Username')
          expect(tableHeader).toBeInTheDocument()

          const toggle = await screen.findByLabelText('Non-Active')
          expect(toggle).toBeInTheDocument()
          await user.click(toggle)

          await waitFor(() =>
            expect(
              screen.queryByLabelText('Non-Active')
            ).not.toBeInTheDocument()
          )

          const activeToggle = await screen.findByText('Activated')
          expect(activeToggle).toBeInTheDocument()

          await waitFor(() => expect(mockActivateUser).toHaveBeenCalled())
        })
      })
    })
  })
})
