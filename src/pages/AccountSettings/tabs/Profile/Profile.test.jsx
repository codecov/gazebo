import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Profile from './Profile'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
      <Route path="/account/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const mockUser = {
  name: 'Codecov User',
  username: 'codecov-user',
  email: 'codecov-user@codecov.io',
  isAdmin: true,
}

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

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
