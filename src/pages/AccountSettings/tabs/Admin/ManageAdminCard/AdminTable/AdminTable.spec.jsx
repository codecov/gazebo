import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminTable from './AdminTable'

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

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AdminTable', () => {
  function setup(adminResults = []) {
    const user = userEvent.setup()
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
      rest.patch('/internal/gh/codecov/users/:owner/', (req, res, ctx) => {
        const owner = req.params.owner
        if (owner) {
          mutate({ owner })
        }

        return res(ctx.status(200), ctx.json({}))
      })
    )

    return { user, mutate }
  }

  describe('renders column names', () => {
    it('renders user name column', () => {
      setup()

      render(<AdminTable />, { wrapper })

      const userName = screen.getByText('User name')
      expect(userName).toBeInTheDocument()
    })

    it('renders email column', () => {
      setup()

      render(<AdminTable />, { wrapper })

      const email = screen.getByText('email')
      expect(email).toBeInTheDocument()
    })

    describe('renders admin list', () => {
      it("renders individual user's user name", async () => {
        setup([
          {
            username: 'codecov-user',
            email: 'user@codecov.io',
            name: 'codecov',
            ownerid: 1,
          },
        ])

        render(<AdminTable />, { wrapper })

        expect(await screen.findByText('codecov-user')).toBeTruthy()
        const userName = screen.getByText('codecov-user')
        expect(userName).toBeInTheDocument()
      })

      it("renders individual user's email", async () => {
        setup([
          {
            username: 'codecov-user',
            email: 'user@codecov.io',
            name: 'codecov',
            ownerid: 1,
          },
        ])

        render(<AdminTable />, { wrapper })

        expect(await screen.findByText('user@codecov.io')).toBeTruthy()
        const userName = screen.getByText('user@codecov.io')
        expect(userName).toBeInTheDocument()
      })

      describe('user clicks revoke button', () => {
        it('calls mutate function', async () => {
          const { user, mutate } = setup([
            {
              username: 'codecov-user',
              email: 'user@codecov.io',
              name: 'codecov',
              ownerid: 1,
            },
          ])

          render(<AdminTable />, { wrapper })

          expect(await screen.findByText('user@codecov.io')).toBeTruthy()

          const btn = screen.getByRole('button', { name: 'Revoke' })
          expect(btn).toBeInTheDocument()
          await user.click(btn)

          await waitFor(() => expect(mutate).toHaveBeenCalled())
          expect(mutate).toHaveBeenCalledWith({ owner: '1' })
        })
      })
    })
  })
})
