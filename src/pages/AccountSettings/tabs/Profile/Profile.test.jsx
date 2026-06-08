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

import Profile from './Profile'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
        <Route path="/account/:provider/:owner">
          <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const mockUser = {
  name: 'Codecov User',
  username: 'codecov-user',
  email: 'codecov-user@codecov.io',
  isAdmin: true,
}

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

describe('Profile', () => {
  function setup() {
    server.use(
      http.get('/internal/users/current', () => {
        return HttpResponse.json(mockUser)
      }),
      graphql.query('Seats', () => {
        return HttpResponse.json({
          data: { config: { seatsUsed: 0, seatsLimit: 10 } },
        })
      })
    )
  }
  describe('rendering component', () => {
    it('renders profile', async () => {
      setup()
      render(<Profile owner="codecov-user" provider="gh" />, { wrapper })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const text = await screen.findByText('Activation Status')
      expect(text).toBeInTheDocument()
    })
  })
})
