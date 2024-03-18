import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { useInfiniteUsers } from './useInfiniteUser'

const mockFirstResponse = {
  count: 2,
  next: 'http://localhost/internal/gh/codecov/users?page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      activated: true,
      student: false,
      lastPullTimestamp: '2021-08-25T00:00:00Z',
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
      student: false,
      lastPullTimestamp: '2021-08-25T00:00:00Z',
    },
  ],
  total_pages: 2,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => server.listen())
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useInfiniteUser', () => {
  function setup(options = {}) {
    server.use(
      rest.get('/internal/gh/codecov/users', (req, res, ctx) => {
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

  describe('hook queries the first dataset', () => {
    beforeEach(() => setup())

    it('returns the data', async () => {
      const { result } = renderHook(
        () =>
          useInfiniteUsers(
            { provider: 'gh', owner: 'codecov', query: {} },
            { retry: false }
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          pageParams: [undefined],
          pages: [
            {
              count: 2,
              next: 'http://localhost/internal/gh/codecov/users?page=2',
              previous: null,
              results: [
                {
                  activated: true,
                  email: 'user1@codecov.io',
                  isAdmin: true,
                  lastPullTimestamp: '2021-08-25T00:00:00Z',
                  name: 'User 1',
                  ownerid: 1,
                  student: false,
                  username: 'user1-codecov',
                },
              ],
              totalPages: 2,
            },
          ],
          results: [
            {
              activated: true,
              email: 'user1@codecov.io',
              isAdmin: true,
              lastPullTimestamp: '2021-08-25T00:00:00Z',
              name: 'User 1',
              ownerid: 1,
              student: false,
              username: 'user1-codecov',
            },
          ],
        })
      )
    })
  })

  describe('hook can fetch the next dataset', () => {
    beforeEach(() => setup())

    it('returns the combined data', async () => {
      const { result } = renderHook(
        () =>
          useInfiniteUsers(
            { provider: 'gh', owner: 'codecov', query: {} },
            { retry: false }
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          pageParams: [undefined, '2'],
          pages: [
            {
              count: 2,
              next: 'http://localhost/internal/gh/codecov/users?page=2',
              previous: null,
              results: [
                {
                  activated: true,
                  email: 'user1@codecov.io',
                  isAdmin: true,
                  lastPullTimestamp: '2021-08-25T00:00:00Z',
                  name: 'User 1',
                  ownerid: 1,
                  student: false,
                  username: 'user1-codecov',
                },
              ],
              totalPages: 2,
            },
            {
              count: 2,
              next: null,
              previous: null,
              results: [
                {
                  activated: true,
                  email: 'user2@codecov.io',
                  isAdmin: true,
                  lastPullTimestamp: '2021-08-25T00:00:00Z',
                  name: 'User 2',
                  ownerid: 2,
                  student: false,
                  username: 'user2-codecov',
                },
              ],
              totalPages: 2,
            },
          ],
          results: [
            {
              activated: true,
              email: 'user1@codecov.io',
              isAdmin: true,
              lastPullTimestamp: '2021-08-25T00:00:00Z',
              name: 'User 1',
              ownerid: 1,
              student: false,
              username: 'user1-codecov',
            },
            {
              activated: true,
              email: 'user2@codecov.io',
              isAdmin: true,
              lastPullTimestamp: '2021-08-25T00:00:00Z',
              name: 'User 2',
              ownerid: 2,
              student: false,
              username: 'user2-codecov',
            },
          ],
        })
      )
    })
  })
})
