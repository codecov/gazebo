import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useMyContexts } from './useMyContexts'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const orgList1 = { username: 'org1', avatarUrl: 'http://127.0.0.1/avatar-url' }

const orgList2 = { username: 'org2', avatarUrl: 'http://127.0.0.1/avatar-url' }

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useMyContexts', () => {
  function setup() {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) => {
        const orgList = !!req.variables?.after ? orgList2 : orgList1
        const hasNextPage = req.variables?.after ? false : true
        const endCursor = req.variables?.after ? 'second' : 'first'

        const queryData = {
          me: {
            owner: {
              username: 'cool-user',
              avatarUrl: 'http://127.0.0.1/avatar-url',
            },
            myOrganizations: {
              edges: [{ node: orgList }],
              pageInfo: {
                hasNextPage,
                endCursor,
              },
            },
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      })
    )
  }

  describe('when calling hook', () => {
    beforeEach(() => setup())

    it('loads initial dataset', async () => {
      const { result } = renderHook(() => useMyContexts({ provider: 'gh' }), {
        wrapper,
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      const expectedData = {
        currentUser: {
          avatarUrl: 'http://127.0.0.1/avatar-url',
          username: 'cool-user',
        },
        myOrganizations: [
          {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            username: 'org1',
          },
        ],
        pageInfo: {
          endCursor: 'first',
          hasNextPage: true,
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedData)
      )
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(() => setup())

    it('returns combined data set', async () => {
      const { result } = renderHook(() => useMyContexts({ provider: 'gh' }), {
        wrapper,
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      const expectedData = {
        currentUser: {
          avatarUrl: 'http://127.0.0.1/avatar-url',
          username: 'cool-user',
        },
        myOrganizations: [
          {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            username: 'org1',
          },
          {
            avatarUrl: 'http://127.0.0.1/avatar-url',
            username: 'org2',
          },
        ],
        pageInfo: {
          endCursor: 'second',
          hasNextPage: false,
        },
      }

      await waitFor(() => expect(result.current.data).toEqual(expectedData))
    })
  })
})
