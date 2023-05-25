import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSelfHostedCurrentUser } from './useSelfHostedCurrentUser'

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
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSelfHostedCurrentUser', () => {
  function setup() {
    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(user))
      )
    )
  }

  describe('when called', () => {
    describe('when data is loaded', () => {
      beforeEach(() => {
        setup()
      })

      it('returns the user info', async () => {
        const { result } = renderHook(() => useSelfHostedCurrentUser(), {
          wrapper,
        })

        await waitFor(() => result.current.isFetching)
        await waitFor(() => !result.current.isFetching)

        await waitFor(() => expect(result.current.data).toEqual(user))
      })
    })
  })
})
