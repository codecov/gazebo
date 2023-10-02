import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCompareTotals } from './useCompareTotals'

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: null,
          impactedFiles: [],
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

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

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

describe('useCompareTotals', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CompareTotals', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockResponse))
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('returns repository typename of Repository', () => {
      describe('there is valid data', () => {
        it('fetches the branch data', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              useCompareTotals({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitid: '123',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              owner: {
                repository: {
                  __typename: 'Repository',
                  commit: {
                    compareWithParent: {
                      __typename: 'Comparison',
                      state: 'pending',
                      patchTotals: null,
                      impactedFiles: [],
                    },
                  },
                },
              },
            })
          )
        })
      })

      describe('there is a null owner', () => {
        it('returns a null value', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              useCompareTotals({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitid: '123',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              owner: null,
            })
          )
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
      beforeAll(() => {
        jest.spyOn(console, 'error')
      })

      afterAll(() => {
        jest.resetAllMocks()
      })

      it('throws a 404', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(
          () =>
            useCompareTotals({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              commitid: '123',
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
      beforeAll(() => {
        jest.spyOn(console, 'error')
      })

      afterAll(() => {
        jest.resetAllMocks()
      })

      it('throws a 403', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () =>
            useCompareTotals({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              commitid: '123',
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
      beforeAll(() => {
        jest.spyOn(console, 'error')
      })

      afterAll(() => {
        jest.resetAllMocks()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useCompareTotals({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              commitid: '123',
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
