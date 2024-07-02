import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettings from './AdminSettings'

jest.mock('./AdminAccess', () => () => 'AdminAccess')
jest.mock('./AdminMembers', () => () => 'AdminMembers')

const user = {
  activated: false,
  email: 'codecov@codecov.io',
  isAdmin: true,
  name: 'Codecov',
  ownerid: 2,
  username: 'codecov',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

let testLocation
const wrapper =
  ({ initialEntries, path }) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={path}>{children}</Route>
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

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminSettings', () => {
  function setup({ data = {} }) {
    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ ...user, ...data }))
      ),
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ me: null }))
      )
    )
  }

  describe('renders access page', () => {
    beforeEach(() => {
      setup({
        data: { isAdmin: true },
      })
    })

    it('renders access page', async () => {
      render(<AdminSettings />, {
        wrapper: wrapper({
          path: '/admin/:provider/access',
          initialEntries: ['/admin/gh/access'],
        }),
      })

      const text = await screen.findByText('AdminAccess')
      expect(text).toBeInTheDocument()
    })
  })

  describe('renders users page', () => {
    beforeEach(() => {
      setup({
        data: { isAdmin: true },
      })
    })

    it('renders users page', async () => {
      render(<AdminSettings />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/users'],
          path: '/admin/:provider/users',
        }),
      })

      const text = await screen.findByText('AdminMembers')
      expect(text).toBeInTheDocument()
    })
  })

  describe('user is not an admin', () => {
    beforeEach(async () => {
      setup({
        data: { isAdmin: false },
      })
    })

    it('redirects the user', async () => {
      render(<AdminSettings />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/users'],
          path: '/admin/:provider/users',
        }),
      })

      await waitFor(() => expect(testLocation.pathname).toBe('/gh'))
    })
  })
})
