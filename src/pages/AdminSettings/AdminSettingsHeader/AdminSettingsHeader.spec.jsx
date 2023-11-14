import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminSettingsHeader from './AdminSettingsHeader'

const loggedInUser = {
  me: {
    user: {
      username: 'Codecov',
      avatarUrl: 'http://127.0.0.1/avatar-url',
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (
    { initialEntries = ['/gh'], path = '/:provider' } = {
      initialEntries: ['/gh'],
      path: '/:provider',
    }
  ) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={path} exact>
            {children}
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('AdminSettingsHeader', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(ctx.status(200), ctx.data(loggedInUser))
      )
    )
  }

  describe('when on global admin', () => {
    beforeEach(() => {
      setup()
    })

    it('displays all orgs and repos link', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })
      const link = await screen.findByRole('link', {
        name: 'Codecov',
      })
      expect(link).toBeInTheDocument()
    })

    it('links to the right location', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const link = await screen.findByRole('link', {
        name: 'Codecov',
      })
      expect(link).toHaveAttribute('href', '/gh/Codecov')
    })

    it('displays admin', async () => {
      render(<AdminSettingsHeader />, {
        wrapper: wrapper({
          initialEntries: ['/admin/gh/access'],
          path: '/admin/:provider/access',
        }),
      })

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })
})
