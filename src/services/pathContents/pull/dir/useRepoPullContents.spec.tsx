import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
  function setup({
    invalidSchema = false,
    repositoryNotFound = false,
    ownerNotActivated = false,
    isMissingCoverage = false,
    isUnknownPath = false,
  }) {
    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
        if (invalidSchema) {
          return res(ctx.status(200), ctx.data({}))
        }
        if (repositoryNotFound) {
          return res(ctx.status(200), ctx.data(mockDataRepositoryNotFound))
        }
        if (ownerNotActivated) {
          return res(ctx.status(200), ctx.data(mockDataOwnerNotActivated))
        }
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
      setup({})
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
        setup({ isMissingCoverage: true })
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
        setup({ isUnknownPath: true })
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

    describe('on invalid schema', () => {
      it('returns 404', async () => {
        setup({ invalidSchema: true })
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
        await waitFor(() => result.current.isError)

        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoPullContents - 404 schema parsing failed',
          })
        )
      })
    })

    describe('on repository not found', () => {
      it('returns 404', async () => {
        setup({ repositoryNotFound: true })
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
        await waitFor(() => result.current.isError)

        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoPullContents - 404 NotFoundError',
          })
        )
      })
    })

    describe('on owner not activated', () => {
      it('returns 403', async () => {
        setup({ ownerNotActivated: true })
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
        await waitFor(() => result.current.isError)

        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'useRepoPullContents - 403 OwnerNotActivatedError',
          })
        )
      })
    })
  })
})
