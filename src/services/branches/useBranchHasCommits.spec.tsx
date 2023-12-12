import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'

import { useBranchHasCommits } from './useBranchHasCommits'

const mockBranchHasCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [
          {
            node: {
              commitid: 'commit-123',
            },
          },
        ],
      },
    },
  },
}

const mockBranchHasNoCommits = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: {
        edges: [],
      },
    },
  },
}

const mockCommitsIsNull = {
  owner: {
    repository: {
      __typename: 'Repository',
      commits: null,
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<p>loading</p>}>{children}</Suspense>
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
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  hasNoCommits?: boolean
  commitsIsNull?: boolean
}

describe('useBranchHasCommits', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    hasNoCommits = false,
    commitsIsNull = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetBranchCommits', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else if (hasNoCommits) {
          return res(ctx.status(200), ctx.data(mockBranchHasNoCommits))
        } else if (commitsIsNull) {
          return res(ctx.status(200), ctx.data(mockCommitsIsNull))
        } else {
          return res(ctx.status(200), ctx.data(mockBranchHasCommits))
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('returns repository typename of Repository', () => {
      describe('the branch has commits', () => {
        it('returns true', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useBranchHasCommits({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
                opts: {
                  suspense: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBeTruthy())
        })
      })

      describe('the branch has no commits', () => {
        it('returns false', async () => {
          setup({ hasNoCommits: true })
          const { result } = renderHook(
            () =>
              useBranchHasCommits({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
                opts: {
                  suspense: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBe(false))
        })
      })

      describe('the commits field is null', () => {
        it('returns false', async () => {
          setup({ commitsIsNull: true })
          const { result } = renderHook(
            () =>
              useBranchHasCommits({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
                opts: {
                  suspense: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBe(false))
        })
      })

      describe('there is a null owner', () => {
        it('returns false', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              useBranchHasCommits({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
                opts: {
                  suspense: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBe(false))
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () =>
            useBranchHasCommits({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })

    describe('returns OwnerNotActivatedError __typename', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 403', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () =>
            useBranchHasCommits({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
            })
          )
        )
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useBranchHasCommits({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              branch: 'main',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })
  })
})
