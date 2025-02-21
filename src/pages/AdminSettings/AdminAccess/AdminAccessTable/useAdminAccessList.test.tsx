import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

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
const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/admin/gh/access') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/admin/:provider/access">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('useAdminAccessList', () => {
  function setup({ invalidResponse = false }) {
    server.use(
      http.get('/internal/users', (info) => {
        if (invalidResponse) {
          return HttpResponse.json({})
        }
        const searchParams = new URL(info.request.url).searchParams
        const pageNumber = Number(searchParams.get('page'))

        if (pageNumber > 1) {
          return HttpResponse.json(mockSecondResponse)
        }

        return HttpResponse.json(mockFirstResponse)
      })
    )
  }

  describe('hook queries first dataset', () => {
    it('returns the data', async () => {
      setup({})
      const { result } = renderHook(() => useAdminAccessList(), {
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
    it('returns the data', async () => {
      setup({})
      const { result } = renderHook(() => useAdminAccessList(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

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

  describe('endpoint returns invalid data', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with 400', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(() => useAdminAccessList(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          dev: 'useAdminAccessList - Parsing Error',
          status: 400,
        })
      )
    })
  })
})
