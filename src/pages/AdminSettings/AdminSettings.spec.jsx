import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
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

const queryClient = new QueryClient()

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminSettings', () => {
  let testLocation
  function setup({ initialEntries = [], path = '', data = {} }) {
    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ ...user, ...data }))
      )
    )

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={path}>
            <AdminSettings />
          </Route>
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
  }

  describe('renders access page', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/access'],
        path: '/admin/:provider/access',
        data: { isAdmin: true },
      })
    })

    it('renders access page', async () => {
      const text = await screen.findByText('AdminAccess')
      expect(text).toBeInTheDocument()
    })
  })

  describe('renders users page', () => {
    beforeEach(() => {
      setup({
        initialEntries: ['/admin/gh/users'],
        path: '/admin/:provider/users',
        data: { isAdmin: true },
      })
    })

    it('renders users page', async () => {
      const text = await screen.findByText('AdminMembers')
      expect(text).toBeInTheDocument()
    })
  })

  describe('user is not an admin', () => {
    beforeEach(async () => {
      queryClient.setQueryData(['SelfHostedCurrentUser'], {
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: false,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })
      setup({
        initialEntries: ['/admin/gh/users'],
        path: '/admin/:provider/users',
        data: { isAdmin: false },
      })
    })

    it('redirects the user', async () => {
      expect(testLocation.pathname).toBe('/gh')
    })
  })
})
