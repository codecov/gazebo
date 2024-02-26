import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchCommitDirEntry } from './usePrefetchCommitDirEntry'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
    <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
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
    username: 'codecov',
    repository: {
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
}

const mockDataMissingCoverage = {
  owner: {
    username: 'codecov',
    repository: {
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

describe('usePrefetchCommitDirEntry', () => {
  function setup(isMissingCoverage = false, isUnknownPath = false) {
    server.use(
      graphql.query('CommitPathContents', (req, res, ctx) => {
        if (isMissingCoverage) {
          return res(ctx.status(200), ctx.data(mockDataMissingCoverage))
        }
        if (isUnknownPath) {
          return res(ctx.status(200), ctx.data(mockDataUnknownPath))
        }
        return res(ctx.status(200), ctx.data(mockData))
      })
    )
  }
  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns runPrefetch function', () => {
      const { result } = renderHook(
        () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      const { result } = renderHook(
        () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
        { wrapper }
      )

      await result.current.runPrefetch()
      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      expect(queryClient.getQueryState().data).toStrictEqual({
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
    })

    describe('on missing coverage', () => {
      it('returns no results', async () => {
        setup(true)
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        await waitFor(() => queryClient.getQueryState().isFetching)
        await waitFor(() => !queryClient.getQueryState().isFetching)

        expect(queryClient.getQueryState().data).toStrictEqual({
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
        setup(false, true)
        const { result } = renderHook(
          () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
          { wrapper }
        )

        await result.current.runPrefetch()
        await waitFor(() => queryClient.getQueryState().isFetching)
        await waitFor(() => !queryClient.getQueryState().isFetching)

        expect(queryClient.getQueryState().data).toStrictEqual({
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
        })
      })
    })
  })
})
