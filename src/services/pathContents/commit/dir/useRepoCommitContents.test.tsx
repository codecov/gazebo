import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
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

interface SetupArgs {
  isMissingCoverage?: boolean
  isUnknownPath?: boolean
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useRepoCommitContents', () => {
  function setup({
    isMissingCoverage = false,
    isUnknownPath = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPathContents', () => {
        if (isMissingCoverage) {
          return HttpResponse.json({ data: mockDataMissingCoverage })
        } else if (isUnknownPath) {
          return HttpResponse.json({ data: mockDataUnknownPath })
        } else if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({})
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
        setup({ isMissingCoverage: true })
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
        setup({ isUnknownPath: true })
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

    describe('owner not activated', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 403 error', async () => {
        setup({ isOwnerNotActivatedError: true })

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

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
              dev: 'useRepoCommitContents - Owner Not Activated',
            })
          )
        )
      })
    })

    describe('failed to parse schema', () => {
      const oldConsoleError = console.error
      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 400 error', async () => {
        setup({ isUnsuccessfulParseError: true })

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

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 400,
              dev: 'useRepoCommitContents - Parsing Error',
            })
          )
        )
      })
    })

    describe('not found error', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404 error', async () => {
        setup({ isNotFoundError: true })
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

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
              dev: 'useRepoCommitContents - Not Found Error',
            })
          )
        )
      })
    })
  })
})
