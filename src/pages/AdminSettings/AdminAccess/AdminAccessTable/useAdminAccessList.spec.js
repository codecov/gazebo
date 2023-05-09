import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAdminAccessList } from './useAdminAccessList'

const mockFirstResponse = {
  count: 2,
  next: 'http://localhost/internal/users?is_admin=true&page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}
const mockSecondResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 2,
      username: 'user2-codecov',
      email: 'user2@codecov.io',
      name: 'User 2',
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/admin/gh/access') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/admin/:provider/access">{children}</Route>
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

describe('useAdminAccessList', () => {
  function setup() {
    server.use(
      rest.get('/internal/users', (req, res, ctx) => {
        const {
          url: { searchParams },
        } = req

        const pageNumber = Number(searchParams.get('page'))

        if (pageNumber > 1) {
          return res(ctx.status(200), ctx.json(mockSecondResponse))
        }

        return res(ctx.status(200), ctx.json(mockFirstResponse))
      })
    )
  }

  describe('hook queries first dataset', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result, waitFor } = renderHook(() => useAdminAccessList(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current.data).toStrictEqual([
          {
            activated: true,
            email: 'user1@codecov.io',
            isAdmin: true,
            name: 'User 1',
            ownerid: 1,
            username: 'user1-codecov',
          },
        ])
      )
    })
  })

  describe('hook fetches the next dataset', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result, waitFor } = renderHook(() => useAdminAccessList(), {
        wrapper: wrapper(),
      })

      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() =>
        expect(result.current.data).toStrictEqual([
          {
            activated: true,
            email: 'user1@codecov.io',
            isAdmin: true,
            name: 'User 1',
            ownerid: 1,
            username: 'user1-codecov',
          },
          {
            ownerid: 2,
            username: 'user2-codecov',
            email: 'user2@codecov.io',
            name: 'User 2',
            isAdmin: true,
            activated: true,
          },
        ])
      )
    })
  })
})
