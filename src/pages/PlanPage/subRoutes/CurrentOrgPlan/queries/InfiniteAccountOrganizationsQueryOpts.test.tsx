import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useInfiniteQuery as useInfiniteQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import { InfiniteAccountOrganizationsQueryOpts } from './InfiniteAccountOrganizationsQueryOpts'

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

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/plan/gh/codecov']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

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
      () =>
        useInfiniteQueryV5(
          InfiniteAccountOrganizationsQueryOpts({ provider, owner })
        ),
      { wrapper }
    )

    console.error = () => {}

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        dev: 'InfiniteAccountOrganizationsQueryOpts - Parsing Error',
        status: 400,
      })
    )
  })

  it('returns 404 when no account for owner', async () => {
    setup({ noAccount: true })
    const { result } = renderHook(
      () =>
        useInfiniteQueryV5(
          InfiniteAccountOrganizationsQueryOpts({ provider, owner })
        ),
      { wrapper }
    )

    console.error = () => {}

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        dev: 'InfiniteAccountOrganizationsQueryOpts - Not Found Error',
        status: 404,
      })
    )
  })

  it('returns organizations for account', async () => {
    setup({})
    const { result } = renderHook(
      () =>
        useInfiniteQueryV5(
          InfiniteAccountOrganizationsQueryOpts({ provider, owner })
        ),
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
      () =>
        useInfiniteQueryV5(
          InfiniteAccountOrganizationsQueryOpts({ provider, owner })
        ),
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
