import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchCommitDirEntry } from './usePrefetchCommitDirEntry'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
    <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})
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
      commit: {
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              name: 'src',
              path: null,
              __typename: 'PathContentDir',
              hits: 4,
              misses: 2,
              percentCovered: 50.0,
              partials: 1,
              lines: 7,
              type: 'file',
              isCriticalFile: false,
            },
          ],
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
      commit: {
        pathContents: {
          __typename: 'MissingCoverage',
          message: 'unknown path',
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
      commit: {
        pathContents: {
          __typename: 'UnknownPath',
          message: 'unknown path',
        },
      },
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockUnsuccessfulParseError = {}

interface SetupArgs {
  isMissingCoverage?: boolean
  isUnknownPath?: boolean
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParse?: boolean
}

describe('usePrefetchCommitDirEntry', () => {
  function setup({
    isMissingCoverage = false,
    isUnknownPath = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParse = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPathContents', (info) => {
        if (isMissingCoverage) {
          return HttpResponse.json({ data: mockDataMissingCoverage })
        } else if (isUnknownPath) {
          return HttpResponse.json({ data: mockDataUnknownPath })
        } else if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParse) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }
        return HttpResponse.json({ data: mockData })
      })
    )
  }
  describe('when called', () => {
    it('returns runPrefetch function', () => {
      setup({})
      const { result } = renderHook(
        () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      setup({})
      const { result } = renderHook(
        () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()
      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
        results: [
          {
            __typename: 'PathContentDir',
            name: 'src',
            path: null,
            percentCovered: 50.0,
            hits: 4,
            misses: 2,
            lines: 7,
            partials: 1,
          },
        ],
      })
    })

    describe('on missing coverage', () => {
      it('returns no results', async () => {
        setup({ isMissingCoverage: true })
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
        })
      })
    })

    describe('on unknown path', () => {
      it('returns no results', async () => {
        setup({ isUnknownPath: true })
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
        })
      })
    })

    describe('and bad response', () => {
      it('returns 404 failed to parse', async () => {
        console.error = () => {}
        setup({ isUnsuccessfulParse: true })
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        expect(queryClient.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchCommitDirEntry - 404 schema parsing failed',
          })
        )
      })
    })

    describe('and returns NotFoundError', () => {
      it('returns 404 not found error', async () => {
        console.error = () => {}
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        expect(queryClient.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchCommitDirEntry - 404 NotFoundError',
          })
        )
      })
    })

    describe('and returns OwnerNotActivated', () => {
      it('returns 403 owner not activated message', async () => {
        console.error = () => {}
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ commit: 'abcdef', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        expect(queryClient.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'usePrefetchCommitDirEntry - 403 OwnerNotActivatedError',
          })
        )
      })
    })
  })
})
