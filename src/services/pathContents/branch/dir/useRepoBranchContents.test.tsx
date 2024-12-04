import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBranchContents } from './useRepoBranchContents'

const mockData = {
  owner: {
    username: 'cool-user',
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
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: [
              {
                node: {
                  __typename: 'PathContentDir',
                  hits: 9,
                  misses: 0,
                  partials: 0,
                  lines: 10,
                  name: 'src',
                  path: 'src',
                  percentCovered: 100.0,
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
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
          deprecatedPathContents: {
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
          deprecatedPathContents: {
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
    username: 'cool-user',
    repository: {
      __typename: 'NotFoundError',
      message: 'repository not found',
    },
  },
}

const mockDataOwnerNotActivated = {
  owner: {
    username: 'cool-user',
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
  <MemoryRouter initialEntries={['/gh/codecov/test']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

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
  isMissingCoverage?: boolean
  isUnknownPath?: boolean
  isRepositoryNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useRepoBranchContents', () => {
  function setup({
    isMissingCoverage = false,
    isUnknownPath = false,
    isOwnerNotActivatedError = false,
    isRepositoryNotFoundError = false,
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

  describe('when called', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'cool-user',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data?.pages[0]).toEqual({
            results: [
              {
                __typename: 'PathContentDir',
                hits: 9,
                misses: 0,
                partials: 0,
                lines: 10,
                name: 'src',
                path: 'src',
                percentCovered: 100.0,
              },
            ],
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            pathContentsType: 'PathContentConnection',
            __typename: undefined,
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          })
        )
      })
    })

    describe('on missing coverage', () => {
      it('returns no results', async () => {
        setup({ isMissingCoverage: true })
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'cool-user',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data?.pages[0]).toEqual({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
            pathContentsType: 'MissingCoverage',
            __typename: undefined,
            pageInfo: undefined,
          })
        )
      })
    })

    describe('on unknown path', () => {
      it('returns no results', async () => {
        setup({ isUnknownPath: true })
        const { result } = renderHook(
          () =>
            useRepoBranchContents({
              provider: 'gh',
              owner: 'cool-user',
              repo: 'another-test',
              branch: 'main',
              path: '',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data?.pages[0]).toEqual({
            indicationRange: {
              upperRange: 80,
              lowerRange: 60,
            },
            results: null,
            pathContentsType: 'UnknownPath',
            __typename: undefined,
            pageInfo: undefined,
          })
        )
      })
    })

    describe('request rejects', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      describe('on repository not found', () => {
        it('rejects to repository not found error', async () => {
          setup({ isUnsuccessfulParseError: true })
          const { result } = renderHook(
            () =>
              useRepoBranchContents({
                provider: 'gh',
                owner: 'cool-user',
                repo: 'another-test',
                branch: 'main',
                path: '',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() =>
            expect(result.current.error).toEqual(
              expect.objectContaining({
                status: 404,
                dev: 'useRepoBranchContents - 404 schema parsing failed',
              })
            )
          )
        })
      })

      describe('on owner not activated', () => {
        it('rejects to owner not activated error', async () => {
          setup({ isRepositoryNotFoundError: true })
          const { result } = renderHook(
            () =>
              useRepoBranchContents({
                provider: 'gh',
                owner: 'cool-user',
                repo: 'another-test',
                branch: 'main',
                path: '',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() =>
            expect(result.current.error).toEqual(
              expect.objectContaining({
                status: 404,
                dev: 'useRepoBranchContents - 404 NotFoundError',
              })
            )
          )
        })
      })

      describe('failing to parse schema', () => {
        it('rejects to unknown error', async () => {
          setup({ isOwnerNotActivatedError: true })
          const { result } = renderHook(
            () =>
              useRepoBranchContents({
                provider: 'gh',
                owner: 'cool-user',
                repo: 'another-test',
                branch: 'main',
                path: '',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() =>
            expect(result.current.error).toEqual(
              expect.objectContaining({
                status: 403,
                dev: 'useRepoBranchContents - 403 OwnerNotActivatedError',
              })
            )
          )
        })
      })
    })
  })
})
