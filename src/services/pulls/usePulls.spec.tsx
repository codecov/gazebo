import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePulls } from './usePulls'

const node1 = {
  pullId: 1,
  title: 'first pull',
  state: 'MERGED',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      percentCovered: 90,
    },
  },
  compareWithBase: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 87,
    },
    changeCoverage: 20,
  },
}

const node2 = {
  pullId: 2,
  title: 'second pull',
  state: 'MERGED',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      percentCovered: 90,
    },
  },
  compareWithBase: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 87,
    },
    changeCoverage: 20,
  },
}

const node3 = {
  pullId: 3,
  title: 'third pull',
  state: 'MERGED',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      percentCovered: 90,
    },
  },
  compareWithBase: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 87,
    },
    changeCoverage: 20,
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

const mockNullOwnerData = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
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

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('GetPulls', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetPulls', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwnerData))
        }

        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                pulls: {
                  edges: req.variables.after
                    ? [
                        {
                          node: node3,
                        },
                      ]
                    : [
                        {
                          node: node1,
                        },
                        {
                          node: node2,
                        },
                      ],
                  pageInfo: {
                    hasNextPage: req.variables.after ? false : true,
                    endCursor: req.variables.after
                      ? 'aa'
                      : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                  },
                },
              },
            },
          })
        )
      })
    )
  }

  describe('when __typename is Repository', () => {
    describe('when valid data is returned', () => {
      describe('when data is loaded', () => {
        it('returns expected pulls nodes', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              usePulls({
                provider,
                owner,
                repo,
                filters: {
                  state: 'MERGED',
                },
                orderingDirection: 'ASC',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() =>
            expect(result.current.data.pulls).toEqual([node1, node2])
          )
        })
      })

      describe('when call next page', () => {
        it('returns prev and next page pulls of the user', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              usePulls({
                provider,
                owner,
                repo,
                filters: {
                  state: 'MERGED',
                },
                orderingDirection: 'ASC',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() => result.current.isFetching)
          await waitFor(() => !result.current.isFetching)

          result.current.fetchNextPage()

          await waitFor(() => result.current.isFetching)
          await waitFor(() => !result.current.isFetching)

          await waitFor(() =>
            expect(result.current.data.pulls).toEqual([node1, node2, node3])
          )
        })
      })
    })

    describe('when null owner is returned', () => {
      it('returns an empty list', async () => {
        setup({ isNullOwner: true })

        const { result } = renderHook(
          () =>
            usePulls({
              provider,
              owner,
              repo,
              filters: {
                state: 'MERGED',
              },
              orderingDirection: 'ASC',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.data.pulls).toEqual([]))
      })
    })
  })

  describe('when __typename is NotFoundError', () => {
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
          usePulls({
            provider,
            owner,
            repo,
            filters: {
              state: 'MERGED',
            },
            orderingDirection: 'ASC',
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

  describe('when __typename is OwnerNotActivatedError', () => {
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
          usePulls({
            provider,
            owner,
            repo,
            filters: {
              state: 'MERGED',
            },
            orderingDirection: 'ASC',
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
          usePulls({
            provider,
            owner,
            repo,
            filters: {
              state: 'MERGED',
            },
            orderingDirection: 'ASC',
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
