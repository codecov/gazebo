import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useMyContexts } from './useMyContexts'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const orgList1 = { username: 'org1', avatarUrl: 'http://127.0.0.1/avatar-url' }
const orgList2 = { username: 'org2', avatarUrl: 'http://127.0.0.1/avatar-url' }

const server = setupServer()
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

interface SetupArgs {
  badResponse?: boolean
}

describe('useMyContexts', () => {
  function setup({ badResponse = false }: SetupArgs) {
    server.use(
      graphql.query('MyContexts', (info) => {
        if (badResponse) {
          return HttpResponse.json({})
        }

        const orgList = info.variables?.after ? orgList2 : orgList1
        const hasNextPage = info.variables?.after ? false : true
        const endCursor = info.variables?.after ? 'second' : 'first'

        const queryData = {
          me: {
            owner: {
              username: 'cool-user',
              avatarUrl: 'http://127.0.0.1/avatar-url',
              defaultOrgUsername: null,
            },
            myOrganizations: {
              edges: [{ node: orgList }],
              pageInfo: { hasNextPage, endCursor },
            },
          },
        }

        return HttpResponse.json({ data: queryData })
      })
    )
  }

  describe('when calling hook', () => {
    it('loads initial dataset', async () => {
      setup({})
      const { result } = renderHook(() => useMyContexts({ provider: 'gh' }), {
        wrapper,
      })

      const expectedData = {
        currentUser: {
          avatarUrl: 'http://127.0.0.1/avatar-url',
          username: 'cool-user',
          defaultOrgUsername: null,
        },
        myOrganizations: [
          { avatarUrl: 'http://127.0.0.1/avatar-url', username: 'org1' },
        ],
        pageInfo: { endCursor: 'first', hasNextPage: true },
      }

      await waitFor(() =>
        expect(result.current.data).toEqual(
          expect.objectContaining(expectedData)
        )
      )
    })

    describe('and response is bad', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('throws 400 failed to parse', async () => {
        console.error = () => {}
        setup({ badResponse: true })
        const { result } = renderHook(() => useMyContexts({ provider: 'gh' }), {
          wrapper,
        })

        await waitFor(() =>
          expect(result.current.failureReason).toEqual(
            expect.objectContaining({
              dev: 'useMyContexts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    it('returns combined data set', async () => {
      setup({})
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
          defaultOrgUsername: null,
        },
        myOrganizations: [
          { avatarUrl: 'http://127.0.0.1/avatar-url', username: 'org1' },
          { avatarUrl: 'http://127.0.0.1/avatar-url', username: 'org2' },
        ],
        pageInfo: { endCursor: 'second', hasNextPage: false },
      }

      await waitFor(() =>
        expect(result.current.data).toEqual(
          expect.objectContaining(expectedData)
        )
      )
    })
  })
})
