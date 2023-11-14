import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from './useUser'

const user = {
  username: 'TerrySmithDC',
  email: 'terry@terry.com',
  name: 'terry',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  onboardingCompleted: false,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
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

describe('useUser', () => {
  function setup(userData) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ me: userData }))
      })
    )
  }

  describe('when query resolves', () => {
    describe('there is user data', () => {
      beforeEach(() => {
        const spy = jest.spyOn(console, 'error')
        spy.mockImplementation(jest.fn())

        setup(user)
      })

      it('returns the user', async () => {
        const { result } = renderHook(() => useUser(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.data).toEqual(user))
      })
    })

    describe('there is no user data', () => {
      beforeEach(() => {
        const spy = jest.spyOn(console, 'error')
        spy.mockImplementation(jest.fn())

        setup(null)
      })

      it('returns the user', async () => {
        const { result } = renderHook(() => useUser(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.data).toEqual(null))
      })
    })
  })
})
