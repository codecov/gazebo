import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullTeam } from './usePullTeam'

const mockCompareData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.tsx',
                missesCount: 0,
                isCriticalFile: false,
                patchCoverage: { coverage: 100 },
              },
            ],
          },
        },
      },
    },
  },
}

const mockPullData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 10,
        compareWithBase: {
          __typename: 'Comparison',
          state: 'pending',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                headName: 'src/App.jsx',
                missesCount: 0,
                isCriticalFile: false,
                patchCoverage: {
                  coverage: 100,
                },
              },
            ],
          },
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
      message: 'pull not found',
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
  jest.useRealTimers()
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

describe('usePullTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetPullTeam', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockPullData))
        }
      }),
      graphql.query('GetPullCompareTotalsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockCompareData))
      })
    )
  }

  describe('when usePull is called', () => {
    describe('api returns valid response', () => {
      it('returns pull info', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            usePullTeam({
              provider: 'gh',
              owner: 'febg',
              repo: 'repo-test',
              pullId: '12',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        const expectedResult = {
          pull: {
            compareWithBase: {
              __typename: 'Comparison',
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: [
                  {
                    headName: 'src/App.tsx',
                    missesCount: 0,
                    isCriticalFile: false,
                    patchCoverage: {
                      coverage: 100,
                    },
                  },
                ],
              },
              patchTotals: {
                coverage: 100,
              },
              state: 'processed',
            },
            pullId: 10,
          },
        }

        await waitFor(() => expect(result.current.data).toEqual(expectedResult))
      })
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            usePullTeam({
              provider: 'gh',
              owner: 'febg',
              repo: 'repo-test',
              pullId: '12',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            pull: null,
          })
        )
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          usePullTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            pullId: '12',
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
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          usePullTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            pullId: '12',
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
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          usePullTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            pullId: '12',
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

describe('usePullTeam polling', () => {
  function setup() {
    let nbCallCompare = 0
    server.use(
      graphql.query(`GetPullTeam`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockPullData))
      }),
      graphql.query(`GetPullCompareTotalsTeam`, (req, res, ctx) => {
        nbCallCompare++

        if (nbCallCompare < 9) {
          return res(ctx.status(200), ctx.data(mockPullData))
        }

        return res(ctx.status(200), ctx.data(mockCompareData))
      })
    )
  }

  describe('when usePull is called', () => {
    beforeEach(async () => {
      setup()
    })

    it('returns pull data merged with what polling fetched', async () => {
      const { result } = renderHook(
        () =>
          usePullTeam({
            provider: 'gh',
            owner: 'febg',
            repo: 'repo-test',
            pullId: '12',
            refetchInterval: 5,
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isSuccess)
      await waitFor(() => {
        if (
          result.current.data?.pull?.compareWithBase?.__typename ===
          'Comparison'
        ) {
          return (
            result.current.data?.pull?.compareWithBase?.state === 'processed'
          )
        }
      })

      await waitFor(() =>
        expect(result.current.data).toEqual({
          pull: {
            pullId: 10,
            compareWithBase: {
              __typename: 'Comparison',
              patchTotals: {
                coverage: 100,
              },
              state: 'processed',
              impactedFiles: {
                __typename: 'ImpactedFiles',
                results: [
                  {
                    headName: 'src/App.tsx',
                    missesCount: 0,
                    isCriticalFile: false,
                    patchCoverage: {
                      coverage: 100,
                    },
                  },
                ],
              },
            },
          },
        })
      )
    })
  })
})
