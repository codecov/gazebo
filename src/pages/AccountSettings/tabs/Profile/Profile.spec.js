import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Profile from './Profile'

const queryClient = new QueryClient()
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
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockUser))
      )
    )
  }
  describe('rendering component', () => {
    beforeEach(async () => {
      setup()
    })

    it('renders profile', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/account/gh/codecov-user']}>
            <Route path="/account/:provider/:owner">
              <Profile owner="codecov-user" provider="gh" />
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const text = await screen.findByText('Activation Status')
      expect(text).toBeInTheDocument()
    })
  })
})
