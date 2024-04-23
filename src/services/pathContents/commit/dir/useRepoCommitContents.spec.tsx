import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoCommitContents } from './useRepoCommitContents'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

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
              name: 'file.ts',
              path: null,
              __typename: 'PathContentFile',
              hits: 24,
              misses: 24,
              percentCovered: 50.0,
              partials: 22,
              lines: 22,
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

describe('useRepoCommitContents', () => {
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

    it('sets isLoading to true', () => {
      const { result } = renderHook(
        () =>
          useRepoCommitContents({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test',
            commit: 'commit-1234',
            path: '',
          }),
        { wrapper }
      )

      expect(result.current.isLoading).toBe(true)
    })

    it('returns path contents', async () => {
      const { result } = renderHook(
        () =>
          useRepoCommitContents({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test',
            commit: 'commit-1234',
            path: '',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedData = {
        results: [
          {
            name: 'file.ts',
            percentCovered: 50,
            __typename: 'PathContentFile',
            hits: 24,
            isCriticalFile: false,
            lines: 22,
            misses: 24,
            path: null,
            partials: 22,
          },
        ],
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
        pathContentsType: 'PathContents',
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedData)
      )
    })

    describe('on missing coverage', () => {
      it('returns no results', async () => {
        setup(true)
        const { result } = renderHook(
          () =>
            useRepoCommitContents({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test',
              commit: 'commit-1234',
              path: '',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toEqual(
          expect.objectContaining({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
          })
        )
      })
    })

    describe('on unknown path', () => {
      it('returns no results', async () => {
        setup(false, true)
        const { result } = renderHook(
          () =>
            useRepoCommitContents({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test',
              commit: 'commit-1234',
              path: '',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toEqual(
          expect.objectContaining({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
          })
        )
      })
    })
  })
})
