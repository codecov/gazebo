import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommitPageData } from './useCommitPageData'

const mockCommitData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'id-1',
      },
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

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: false,
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
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('useCommitPageData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPageData', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockCommitData))
        }
      })
    )
  }

  describe('when executed', () => {
    describe('returns Repository __typename', () => {
      describe('there is data', () => {
        it('fetches the correct data', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              useCommitPageData({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitId: 'id-1',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            isCurrentUserPartOfOrg: true,
            commit: {
              commitid: 'id-1',
            },
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResult)
          )
        })
      })
      describe('there is a null owner', () => {
        it('returns null value', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              useCommitPageData({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitId: 'id-1',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            isCurrentUserPartOfOrg: null,
            commit: null,
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResult)
          )
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

      it('throws an error', async () => {
        setup({ isNotFoundError: true })

        const { result } = renderHook(
          () =>
            useCommitPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
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
            useCommitPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
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
            useCommitPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
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
