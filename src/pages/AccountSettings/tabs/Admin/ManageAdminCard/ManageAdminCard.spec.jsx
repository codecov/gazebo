import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ManageAdminCard from './ManageAdminCard'

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
    const searchParams = jest.fn()

    server.use(
      rest.get('/internal/gh/codecov/users', (req, res, ctx) => {
        const searchParam = req.url.searchParams.get('search')

        if (searchParam !== null && searchParam !== '') {
          searchParams(searchParam)

          return res(
            ctx.status(200),
            ctx.json({
              count: 1,
              next: null,
              previous: null,
              results: [
                {
                  activated: true,
                  is_admin: false,
                  username: 'searched-user',
                  email: 'searched-user@codecov.io',
                  ownerid: 10,
                  student: false,
                  name: 'searching-user',
                  last_pull_timestamp: null,
                },
              ],
              total_pages: 1,
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.json({
            ...mockUsersRequest,
            results: adminResults,
          })
        )
      }),
      rest.patch('/internal/gh/codecov/users/:userId/', (req, res, ctx) => {
        const userId = req.params.userId

        mutate(userId)

        return res(ctx.status(200), ctx.json({}))
      })
    )

    return { refetch, mutate, user, searchParams }
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

      expect(await screen.findByText('spookyfun')).toBeTruthy()
      const username = screen.getByText('spookyfun')
      expect(username).toBeInTheDocument()

      expect(await screen.findByText('c3@cr.io')).toBeTruthy()
      const email = screen.getByText('c3@cr.io')
      expect(email).toBeInTheDocument()
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

  describe('adding a new admin', () => {
    it('calls the mutate function', async () => {
      const { user, searchParams, mutate } = setup([
        { username: 'spookyfun', email: 'c3@cr.io', name: 'laudna' },
      ])
      render(<ManageAdminCard />, { wrapper })

      expect(await screen.findByRole('combobox')).toBeTruthy()
      const input = screen.getByRole('combobox')
      await user.type(input, 'cool-user')

      await waitFor(() => expect(searchParams).toBeCalledWith('cool-user'))

      expect(await screen.findByText('searching-user')).toBeTruthy()
      const searchedUser = screen.getByText('searching-user')
      expect(searchedUser).toBeInTheDocument()

      await user.click(searchedUser)

      await waitFor(() => expect(mutate).toBeCalled())
      await waitFor(() => expect(mutate).toBeCalledWith('10'))
    })
  })
})
