import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchBranchDirEntry } from './usePrefetchBranchDirEntry'

const mockData = {
  owner: {
    username: 'codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            __typename: 'PathContents',
            results: [
              {
                __typename: 'PathContentDir',
                name: 'src',
                path: null,
                percentCovered: 0.0,
                hits: 4,
                misses: 2,
                lines: 7,
                partials: 1,
              },
            ],
          },
        },
      },
    },
  },
}

const mockDataUnknownPath = {
  owner: {
    username: 'codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            message: 'path cannot be found',
            __typename: 'UnknownPath',
          },
        },
      },
    },
  },
}

const mockDataMissingCoverage = {
  owner: {
    username: 'codecov',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            message: 'files missing coverage',
            __typename: 'MissingCoverage',
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

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
      <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
        {children}
      </Route>
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

interface SetupArgs {
  isMissingCoverage?: boolean
  isUnknownPath?: boolean
  isRepositoryNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('usePrefetchBranchDirEntry', () => {
  function setup({
    isMissingCoverage = false,
    isUnknownPath = false,
    isRepositoryNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('BranchContents', (info) => {
        if (isMissingCoverage) {
          return HttpResponse.json({ data: mockDataMissingCoverage })
        } else if (isUnknownPath) {
          return HttpResponse.json({ data: mockDataUnknownPath })
        } else if (isRepositoryNotFoundError) {
          return HttpResponse.json({ data: mockDataRepositoryNotFound })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockDataOwnerNotActivated })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }

        return HttpResponse.json({ data: mockData })
      })
    )
  }

  it('returns runPrefetch function', () => {
    setup({})
    const { result } = renderHook(
      () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    setup({})
    const { result } = renderHook(
      () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    await result.current.runPrefetch()
    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    await waitFor(() =>
      expect(queryClient?.getQueryData(queryKey)).toEqual(
        expect.objectContaining({
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: [
            {
              __typename: 'PathContentDir',
              name: 'src',
              path: null,
              percentCovered: 0,
              hits: 4,
              misses: 2,
              lines: 7,
              partials: 1,
            },
          ],
        })
      )
    )
  })

  describe('on missing coverage', () => {
    it('returns no results', async () => {
      setup({ isMissingCoverage: true })
      const { result } = renderHook(
        () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()
      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryData(queryKey)).toEqual(
          expect.objectContaining({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
          })
        )
      )
    })
  })

  describe('on unknown path', () => {
    it('returns no results', async () => {
      setup({ isUnknownPath: true })
      const { result } = renderHook(
        () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()
      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryData(queryKey)).toEqual(
          expect.objectContaining({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
          })
        )
      )
    })
  })

  describe('rejecting request', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('fails to parse bad schema', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchBranchDirEntry - 404 schema parsing failed',
          })
        )
      )
    })

    it('rejects on repository not found error', async () => {
      setup({ isRepositoryNotFoundError: true })
      const { result } = renderHook(
        () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchBranchDirEntry - 404 NotFoundError',
          })
        )
      )
    })

    it('rejects on owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'usePrefetchBranchDirEntry - 403 OwnerNotActivatedError',
          })
        )
      )
    })
  })
})
