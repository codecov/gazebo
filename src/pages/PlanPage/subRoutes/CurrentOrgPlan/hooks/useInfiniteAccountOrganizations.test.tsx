import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import { useInfiniteAccountOrganizations } from './useInfiniteAccountOrganizations'

const org1 = {
  username: 'org1',
  activatedUserCount: 7,
  isCurrentUserPartOfOrg: true,
}

const org2 = {
  username: 'org2',
  activatedUserCount: 4,
  isCurrentUserPartOfOrg: false,
}

const org3 = {
  username: 'org3',
  activatedUserCount: 2,
  isCurrentUserPartOfOrg: true,
}

const mockPageOne = {
  owner: {
    account: {
      organizations: {
        edges: [
          {
            node: org1,
          },
          {
            node: org2,
          },
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'asdf',
        },
      },
    },
  },
}

const mockPageTwo = {
  owner: {
    account: {
      organizations: {
        edges: [
          {
            node: org3,
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/plan']}>
      <Route path="/:provider/:owner/plan">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  invalidResponse?: boolean
  noAccount?: boolean
}

describe('useInfiniteAccountOrganizations', () => {
  function setup({ invalidResponse = false, noAccount = false }: SetupArgs) {
    server.use(
      graphql.query('InfiniteAccountOrganizations', (info) => {
        if (invalidResponse) {
          return HttpResponse.json({ data: {} })
        } else if (noAccount) {
          return HttpResponse.json({
            data: {
              owner: {
                account: null,
              },
            },
          })
        } else if (info.variables.after) {
          return HttpResponse.json({
            data: mockPageTwo,
          })
        }
        return HttpResponse.json({
          data: mockPageOne,
        })
      })
    )
  }

  const provider = 'gh'
  const owner = 'codecov'

  it('returns 404 when bad response from api', async () => {
    setup({ invalidResponse: true })
    const { result } = renderHook(
      () => useInfiniteAccountOrganizations({ provider, owner }),
      { wrapper }
    )

    console.error = () => {}

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 404,
        data: {},
        dev: 'useInfiniteAccountOrganizations - 404 Failed to parse data',
      })
    )
  })

  it('returns 404 when no account for owner', async () => {
    setup({ noAccount: true })
    const { result } = renderHook(
      () => useInfiniteAccountOrganizations({ provider, owner }),
      { wrapper }
    )

    console.error = () => {}

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 404,
        data: {},
        dev: 'useInfiniteAccountOrganizations - 404 Cannot find Account for Owner',
      })
    )
  })

  it('returns organizations for account', async () => {
    setup({})
    const { result } = renderHook(
      () => useInfiniteAccountOrganizations({ provider, owner }),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.data?.pages).toEqual([
        {
          organizations: [org1, org2],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'asdf',
          },
        },
      ])
    )
  })

  it('returns second page of orgs for account', async () => {
    setup({})
    const { result } = renderHook(
      () => useInfiniteAccountOrganizations({ provider, owner }),
      { wrapper }
    )

    await waitFor(() =>
      expect(result.current.data?.pages).toEqual([
        {
          organizations: [org1, org2],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'asdf',
          },
        },
      ])
    )

    await result.current.fetchNextPage()

    await waitFor(() =>
      expect(result.current.data?.pages).toEqual([
        {
          organizations: [org1, org2],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'asdf',
          },
        },
        {
          organizations: [org3],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      ])
    )
  })
})
