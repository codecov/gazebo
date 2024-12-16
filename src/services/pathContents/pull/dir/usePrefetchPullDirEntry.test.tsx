import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchPullDirEntry } from './usePrefetchPullDirEntry'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
    <Route path="/:provider/:owner/:repo/tree/:branch/:path">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      pull: {
        head: {
          commitid: 'commit123',
          pathContents: {
            __typename: 'PathContents',
            results: [
              {
                __typename: 'PathContentDir',
                name: 'src',
                path: null,
                hits: 4,
                misses: 2,
                partials: 1,
                lines: 10,
                percentCovered: 40.0,
              },
            ],
          },
        },
      },
    },
  },
}

const mockDataRepositoryNotFound = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repository not found',
    },
  },
}

const mockDataOwnerNotActivated = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

describe('usePrefetchPullDirEntry', () => {
  function setup({
    invalidSchema = false,
    repositoryNotFound = false,
    ownerNotActivated = false,
  }) {
    server.use(
      graphql.query('PullPathContents', () => {
        if (invalidSchema) {
          return HttpResponse.json({ data: {} })
        } else if (repositoryNotFound) {
          return HttpResponse.json({ data: mockDataRepositoryNotFound })
        } else if (ownerNotActivated) {
          return HttpResponse.json({ data: mockDataOwnerNotActivated })
        }
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  beforeEach(async () => {
    setup({})
  })

  it('returns runPrefetch function', () => {
    const { result } = renderHook(
      () =>
        usePrefetchPullDirEntry({
          pullId: 'pullasdf',
          path: 'src',
        }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    const { result } = renderHook(
      () =>
        usePrefetchPullDirEntry({
          pullId: 'pullasdf',
          path: 'src',
        }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
      __typename: 'PathContents',
      results: [
        {
          __typename: 'PathContentDir',
          name: 'src',
          path: null,
          percentCovered: 40.0,
          hits: 4,
          misses: 2,
          lines: 10,
          partials: 1,
        },
      ],
    })
  })

  it('fails to parse bad schema', async () => {
    setup({ invalidSchema: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullDirEntry({
          pullId: 'pullasdf',
          path: 'src',
        }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.error).toEqual(
        expect.objectContaining({
          status: 404,
          dev: 'usePrefetchPullDirEntry - 404 schema parsing failed',
        })
      )
    )
  })

  it('rejects on repository not found error', async () => {
    setup({ repositoryNotFound: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullDirEntry({
          pullId: 'pullasdf',
          path: 'src',
        }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.error).toEqual(
        expect.objectContaining({
          status: 404,
          dev: 'usePrefetchPullDirEntry - 404 NotFoundError',
        })
      )
    )
  })

  it('rejects on owner not activated error', async () => {
    setup({ ownerNotActivated: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullDirEntry({
          pullId: 'pullasdf',
          path: 'src',
        }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient.getQueryState(queryKey)?.error).toEqual(
        expect.objectContaining({
          status: 403,
          dev: 'usePrefetchPullDirEntry - 403 OwnerNotActivatedError',
        })
      )
    )
  })
})
