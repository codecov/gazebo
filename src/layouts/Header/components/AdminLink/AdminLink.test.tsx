import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminLink from './AdminLink'

const wrapper: ({
  initialEntries,
}: {
  initialEntries?: string
}) => React.FC<React.PropsWithChildren> =
  ({ initialEntries = '/gh' }) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider" exact>
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  cleanup()
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('AdminLink', () => {
  function setup(data = {}) {
    server.use(
      http.get('/internal/users/current', (info) => {
        return HttpResponse.json(data, { status: 200 })
      })
    )
  }

  describe('user is an admin', () => {
    it('renders link to access page', async () => {
      setup({
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: true,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })

      render(<AdminLink />, { wrapper: wrapper({}) })
      const link = await screen.findByText(/Admin/)

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })
  })

  describe('user is not an admin', () => {
    it('renders nothing', () => {
      setup({
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: false,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })

      const { container } = render(<AdminLink />, { wrapper: wrapper({}) })
      expect(container).toBeEmptyDOMElement()
    })
  })
})
