import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettings from './AdminSettings'

vi.mock('./AdminAccess', () => ({ default: () => 'AdminAccess' }))
vi.mock('./AdminMembers', () => ({ default: () => 'AdminMembers' }))

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

let testLocation
const wrapper =
  ({ initialEntries, path }) =>
  ({ children }) => (
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

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('AdminSettings', () => {
  function setup({ data = {} }) {
    server.use(
      http.get('/internal/users/current', (info) => {
        return HttpResponse.json({ ...user, ...data })
      }),
      graphql.query('CurrentUser', (req, res, ctx) => {
        return HttpResponse.json({ data: { me: null } })
      })
    )
  }

  describe('renders access page', () => {
    it('renders access page', async () => {
      setup({ data: { isAdmin: true } })
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
    it('renders users page', async () => {
      setup({ data: { isAdmin: true } })
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
    it('redirects the user', async () => {
      setup({ data: { isAdmin: false } })
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
