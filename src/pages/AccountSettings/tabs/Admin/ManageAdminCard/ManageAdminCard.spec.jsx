import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ManageAdminCard from './ManageAdminCard'

jest.mock('./AddAdmins', () => () => 'AddAdmins')

const mockUsersRequest = {
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

const server = setupServer()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('ManageAdminCard', () => {
  function setup(adminResults = []) {
    const user = userEvent.setup()
    const refetch = jest.fn()
    const mutate = jest.fn()

    server.use(
      rest.get('/internal/gh/codecov/users', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            ...mockUsersRequest,
            results: adminResults,
          })
        )
      }),
      rest.patch('/internal/gh/codecov/users/someid/', (req, res, ctx) => {
        mutate()

        return res(ctx.status(200), ctx.json({}))
      })
    )

    return { refetch, mutate, user }
  }

  describe('when rendered when there are no admins', () => {
    beforeEach(() => setup([]))

    it('renders an empty copy', async () => {
      render(<ManageAdminCard />, { wrapper })

      const noAdmins = await screen.findByText(
        /No admins yet. Note that admins in your Github organization are automatically considered admins./
      )
      expect(noAdmins).toBeInTheDocument()
    })
  })

  describe('when rendered when there are no admins and its not a list', () => {
    beforeEach(() => setup(null))

    it('renders an empty copy', async () => {
      render(<ManageAdminCard />, { wrapper })

      const noAdmins = await screen.findByText(
        /No admins yet. Note that admins in your Github organization are automatically considered admins./
      )
      expect(noAdmins).toBeInTheDocument()
    })
  })

  describe('when rendered with admins', () => {
    it('renders the admins', async () => {
      setup([{ username: 'spookyfun', email: 'c3@cr.io', name: 'laudna' }])
      render(<ManageAdminCard />, { wrapper })

      const name = await screen.findByText('laudna')
      expect(name).toBeInTheDocument()
      const username = await screen.findByText('@spookyfun')
      expect(username).toBeInTheDocument()
      const email = await screen.findByText('c3@cr.io')
      expect(email).toBeInTheDocument()
    })
  })

  describe('when queryclient is fetching', () => {
    it('renders spinner', async () => {
      setup()
      render(<ManageAdminCard />, { wrapper })

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('when clicking on revoking admin', () => {
    it('calls the mutation with the user and is_admin=false', async () => {
      const { mutate, user } = setup([
        {
          username: 'laudna',
          email: 'c3@cr.io',
          name: 'laudna',
          ownerid: 'someid',
        },
      ])

      render(<ManageAdminCard />, { wrapper })

      const revokeButton = await screen.findByRole('button', {
        name: /revoke/i,
      })
      await user.click(revokeButton)

      await waitFor(() => {
        expect(mutate).toHaveBeenCalled()
      })
    })
  })
})
