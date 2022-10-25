import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import MembersList from './MembersList'

const mockUsersRequest = {
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
        res(ctx.status(200), ctx.json({ data: accountDetails }))
      ),
      rest.get('/internal/gh/codecov/users', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockUsersRequest))
      ),
      rest.patch('/gh/codecov/users/:ownerid/', (req, res, ctx) =>
        res(ctx.status(200))
      )
    )
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

      const textfield = await screen.findByRole('textbox')
      expect(textfield).toBeInTheDocument()
    })
    it('renders MembersTable', async () => {
      render(<MembersList />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )

      const tableEntry = await screen.findByText('codecov')
      expect(tableEntry).toBeInTheDocument()
    })
  })

  describe('interacting with the status selector', () => {
    beforeEach(() => setup())
    describe('selecting Active Users', () => {
      it('updates select text', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('All users')
        userEvent.click(select)

        const selectActive = screen.getByText('Active users')
        userEvent.click(selectActive)

        const activeUsers = screen.getByText('Active users')
        expect(activeUsers).toBeInTheDocument()
      })

      it('updates query params', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('All users')
        userEvent.click(select)

        const selectActive = screen.getByText('Active users')
        userEvent.click(selectActive)

        expect(testLocation.search).toBe('?activated=True')
      })
    })
    describe('selecting Inactive Users', () => {
      it('updates select text', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('All users')
        userEvent.click(select)

        const selectActive = screen.getByText('Inactive users')
        userEvent.click(selectActive)

        const inactiveUsers = screen.getByText('Inactive users')
        expect(inactiveUsers).toBeInTheDocument()
      })

      it('updates query params', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('All users')
        userEvent.click(select)

        const selectInactive = screen.getByText('Inactive users')
        userEvent.click(selectInactive)

        expect(testLocation.search).toBe('?activated=False')
      })
    })
  })

  describe('interacting with the role selector', () => {
    beforeEach(() => setup())
    describe('selecting Admins Users', () => {
      it('updates select text', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectAdmins = screen.getByText('Admins')
        userEvent.click(selectAdmins)

        const admins = screen.getByText('Admins')
        expect(admins).toBeInTheDocument()
      })

      it('updates query params', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectAdmins = screen.getByText('Admins')
        userEvent.click(selectAdmins)

        expect(testLocation.search).toBe('?isAdmin=True')
      })
    })
    describe('selecting Developers', () => {
      it('updates select text', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectDevelopers = screen.getByText('Developers')
        userEvent.click(selectDevelopers)

        const developers = screen.getByText('Developers')
        expect(developers).toBeInTheDocument()
      })

      it('updates query params', () => {
        render(<MembersList />, { wrapper })

        const select = screen.getByText('Everyone')
        userEvent.click(select)

        const selectDevelopers = screen.getByText('Developers')
        userEvent.click(selectDevelopers)

        expect(testLocation.search).toBe('?isAdmin=False')
      })
    })
  })

  describe('interacting with user toggles', () => {})
})
