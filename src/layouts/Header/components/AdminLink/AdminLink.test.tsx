import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminLink from './AdminLink'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: ({
  initialEntries,
}: {
  initialEntries?: string
}) => React.FC<React.PropsWithChildren> =
  ({ initialEntries = '/gh' }) =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider" exact>
          <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('AdminLink', () => {
  function setup(data = {}) {
    server.use(
      http.get('/internal/users/current', () => {
        return HttpResponse.json(data)
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
    it('renders nothing', async () => {
      setup({
        activated: false,
        email: 'codecov@codecov.io',
        isAdmin: false,
        name: 'Codecov',
        ownerid: 2,
        username: 'codecov',
      })

      const { container } = render(<AdminLink />, { wrapper: wrapper({}) })
      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })
})
