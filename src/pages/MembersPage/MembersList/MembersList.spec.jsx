import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import 'react-intersection-observer/test-utils'

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

const queryClient = new QueryClient()
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('MembersList', () => {
  let testLocation
  let sendActivatedUser = false

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

  function setup({ accountDetails = {} }) {
    server.use(
      rest.get('/internal/gh/codecov/account-details', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountDetails))
      ),
      rest.get('/internal/gh/codecov/users', (req, res, ctx) => {
        if (sendActivatedUser) {
          sendActivatedUser = false
          return res(ctx.status(200), ctx.json(mockActiveUserRequest))
        }
        return res(ctx.status(200), ctx.json(mockNonActiveUserRequest))
      }),
      rest.patch('/internal/gh/codecov/users/:ownerid', (req, res, ctx) => {
        sendActivatedUser = true
        return res(ctx.status(200))
      })
    )
  }

  describe('rendering MembersList', () => {
    beforeEach(() => setup({}))

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

      const tableHeader = await screen.findByText('User name')
      expect(tableHeader).toBeInTheDocument()

      const tableEntry = await screen.findByText('codecov')
      expect(tableEntry).toBeInTheDocument()
    })
  })

  describe('interacting with the status selector', () => {
    beforeEach(() => setup({}))
    describe('selecting Active Users', () => {
      it('updates select text', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        userEvent.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Active users',
        })
        userEvent.click(selectActive)

        const activeUsers = await screen.findByText('Active users')
        expect(activeUsers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        userEvent.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Active users',
        })
        userEvent.click(selectActive)

        await waitFor(() => expect(testLocation.search).toBe('?activated=True'))
      })
    })

    describe('selecting Inactive Users', () => {
      it('updates select text', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        userEvent.click(select)

        const selectActive = await screen.findByRole('option', {
          name: 'Inactive users',
        })
        userEvent.click(selectActive)

        const inactiveUsers = await screen.findByText('Inactive users')
        expect(inactiveUsers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('All users')
        userEvent.click(select)

        const selectInactive = await screen.findByRole('option', {
          name: 'Inactive users',
        })
        userEvent.click(selectInactive)

        await waitFor(() =>
          expect(testLocation.search).toBe('?activated=False')
        )
      })
    })
  })

  describe('interacting with the search field', () => {
    describe('user types into search field', () => {
      beforeEach(() => {
        setup({})
      })

      it('updates url params', async () => {
        render(<MembersList />, { wrapper })

        const searchField = await screen.findByTestId('search-input-members')
        userEvent.type(searchField, 'codecov')

        await waitFor(() => expect(testLocation.search).toBe('?search=codecov'))
      })
    })
  })

  describe('interacting with the role selector', () => {
    beforeEach(() => setup({}))
    describe('selecting Admins Users', () => {
      it('updates select text', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('Everyone')
        userEvent.click(select)

        const selectAdmins = await screen.findByRole('option', {
          name: 'Admins',
        })
        userEvent.click(selectAdmins)

        const admins = await screen.findByText('Admins')
        expect(admins).toBeInTheDocument()
      })

      it('updates query params', async () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectAdmins = screen.getByText('Admins')
        userEvent.click(selectAdmins)

        await waitFor(() => expect(testLocation.search).toBe('?isAdmin=True'))
      })
    })

    describe('selecting Developers', () => {
      it('updates select text', async () => {
        render(<MembersList />, { wrapper })

        const select = await screen.findByText('Everyone')
        userEvent.click(select)

        const selectDevelopers = await screen.findByText('Developers')
        userEvent.click(selectDevelopers)

        const developers = await screen.findByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates query params', async () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectDevelopers = screen.getByText('Developers')
        userEvent.click(selectDevelopers)

        await waitFor(() => expect(testLocation.search).toBe('?isAdmin=False'))
      })
    })
  })

  describe('interacting with user toggles', () => {
    describe('user has reached max seats, and on a free plan', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            activatedUserCount: 100,
            plan: { value: 'users-free' },
          },
        })
      })

      it('opens up upgrade modal', async () => {
        render(<MembersList />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const tableHeader = await screen.findByText('User name')
        expect(tableHeader).toBeInTheDocument()

        const toggle = await screen.findByLabelText('Non-Active')
        expect(toggle).toBeInTheDocument()
        userEvent.click(toggle)

        const modalHeader = await screen.findByText('Upgrade to Pro')
        expect(modalHeader).toBeInTheDocument()
      })
    })

    describe('user has not reached max seats', () => {
      beforeEach(() => {
        setup({
          accountDetails: {
            activatedUserCount: 0,
            plan: { value: 'users-free' },
          },
        })
      })

      it('opens up upgrade modal', async () => {
        render(<MembersList />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )

        const tableHeader = await screen.findByText('User name')
        expect(tableHeader).toBeInTheDocument()

        const toggle = await screen.findByLabelText('Non-Active')
        expect(toggle).toBeInTheDocument()
        userEvent.click(toggle)

        await waitFor(() => queryClient.isMutating)
        await waitFor(() => !queryClient.isMutating)
        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const activeToggle = await screen.findByText('Activated')
        expect(activeToggle).toBeInTheDocument()
      })
    })
  })
})
