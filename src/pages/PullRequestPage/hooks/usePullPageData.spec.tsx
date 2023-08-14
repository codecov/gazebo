import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullPageData } from './usePullPageData'

const mockPullData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: true,
      pull: {
        pullId: 1,
        head: {
          commitid: '123',
        },
        compareWithBase: {
          __typename: 'Comparison',
          impactedFilesCount: 4,
          indirectChangedFilesCount: 0,
          flagComparisonsCount: 1,
          componentComparisonsCount: 6,
          directChangedFilesCount: 0,
        },
      },
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
}

describe('usePullPageData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullPageData', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else {
          return res(ctx.status(200), ctx.data(mockPullData))
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('repository __typename of Repository', () => {
      it('returns the correct data', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            hasAccess: true,
            pull: {
              pullId: 1,
              head: {
                commitid: '123',
              },
              compareWithBase: {
                __typename: 'Comparison',
                impactedFilesCount: 4,
                indirectChangedFilesCount: 0,
                flagComparisonsCount: 1,
                componentComparisonsCount: 6,
                directChangedFilesCount: 0,
              },
            },
          })
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

      it('throws a 404', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () =>
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
            }),
          {
            wrapper,
          }
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
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
            }),
          {
            wrapper,
          }
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
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
            }),
          {
            wrapper,
          }
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
