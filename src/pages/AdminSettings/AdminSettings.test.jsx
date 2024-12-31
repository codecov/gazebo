import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
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
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

let testLocation
const wrapper =
  ({ initialEntries, path }) =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Suspense fallback={<div>Loading</div>}>
            <Route path={path}>{children}</Route>
            <Route
              path="*"
              render={({ location }) => {
                testLocation = location
                return null
              }}
            />
          </Suspense>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AdminSettings', () => {
  function setup({ data = {} }) {
    server.use(
      http.get('/internal/users/current', () => {
        return HttpResponse.json({ ...user, ...data })
      }),
      graphql.query('CurrentUser', () => {
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
