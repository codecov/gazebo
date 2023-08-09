import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommitHeaderData } from './useCommitHeaderData'

const mockRepository = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: 'id-1',
        createdAt: '2022-01-01T12:59:59',
        message: 'cool commit message',
        pullId: 1234,
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockResolverError = {
  owner: {
    repository: {
      __typename: 'ResolverError',
      message: 'resolver error',
    },
  },
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, useErrorBoundary: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
  isResolverError?: boolean
  isUnsuccessfulParseError?: boolean
}

describe('useCommitHeaderData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isResolverError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPageHeaderData', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isResolverError) {
          return res(ctx.status(200), ctx.data(mockResolverError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else {
          return res(ctx.status(200), ctx.data(mockRepository))
        }
      })
    )
  }

  describe('fetching data', () => {
    describe('returns Repository __typename', () => {
      it('sets the correct data', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            useCommitHeaderData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
            }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const expectedResult = {
          __typename: 'Repository',
          commit: {
            author: {
              username: 'cool-user',
            },
            branchName: 'cool-branch',
            ciPassed: true,
            commitid: 'id-1',
            createdAt: '2022-01-01T12:59:59',
            message: 'cool commit message',
            pullId: 1234,
          },
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResult)
        )
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

      it('throws an error', async () => {
        setup({ isNotFoundError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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

      it('throws an error', async () => {
        setup({ isOwnerNotActivatedError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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

    describe('returns ResolverError __typename', () => {
      let oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws an error', async () => {
        setup({ isResolverError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 500,
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

      it('throws an error', async () => {
        setup({ isUnsuccessfulParseError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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
