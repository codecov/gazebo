import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { ReactNode } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoPullContents } from './useRepoPullContents'

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
      pull: {
        head: {
          commitid: 'commit123',
          pathContents: {
            __typename: 'PathContents',
            results: [
              {
                __typename: 'PathContentFile',
                name: 'file.ts',
                path: 'src/file.ts',
                hits: 5,
                misses: 5,
                partials: 0,
                lines: 10,
                percentCovered: 50.0,
                isCriticalFile: false,
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
      pull: {
        head: {
          commitid: 'commit123',
          pathContents: {
            message: 'Unknown path',
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
      pull: {
        head: {
          commitid: 'commit123',
          pathContents: {
            message: 'files missing coverage',
            __typename: 'MissingCoverage',
          },
        },
      },
    },
  },
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test/pull/123']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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

describe('useRepoPullContents', () => {
  function setup(isMissingCoverage = false, isUnknownPath = false) {
    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
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

    it('returns path contents', async () => {
      const { result } = renderHook(
        () =>
          useRepoPullContents({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test',
            pullId: '123',
            path: '',
          }),
        { wrapper }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      const expectedData = {
        results: [
          {
            __typename: 'PathContentFile',
            name: 'file.ts',
            path: 'src/file.ts',
            hits: 5,
            misses: 5,
            partials: 0,
            lines: 10,
            percentCovered: 50.0,
            isCriticalFile: false,
          },
        ],
        commitid: 'commit123',
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
            useRepoPullContents({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test',
              pullId: '123',
              path: '',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toEqual({
          commitid: 'commit123',
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
          pathContentsType: 'MissingCoverage',
        })
      })
    })

    describe('on unknown path', () => {
      it('returns no results', async () => {
        setup(false, true)
        const { result } = renderHook(
          () =>
            useRepoPullContents({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test',
              pullId: '123',
              path: '',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toEqual({
          commitid: 'commit123',
          indicationRange: {
            upperRange: 80,
            lowerRange: 60,
          },
          results: null,
          pathContentsType: 'UnknownPath',
        })
      })
    })
  })
})
