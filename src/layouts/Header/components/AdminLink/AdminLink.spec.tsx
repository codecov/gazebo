import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
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
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminLink', () => {
  function setup(data = {}) {
    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(data))
      )
    )
  }

  describe('user is an admin', () => {
    beforeEach(() => {
      setup({
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: true,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })
    })

    it('renders link to access page', async () => {
      render(<AdminLink />, { wrapper: wrapper({}) })
      const link = await screen.findByText(/Admin/)

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/gh/access')
    })
  })

  describe('user is not an admin', () => {
    beforeEach(() => {
      setup({
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: false,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })
    })

    const { container } = render(<AdminLink />, { wrapper: wrapper({}) })

    it('renders nothing', () => {
      expect(container).toBeEmptyDOMElement()
    })
  })
})
