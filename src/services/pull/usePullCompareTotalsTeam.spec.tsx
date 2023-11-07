import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullCompareTotalsTeam } from './usePullCompareTotalsTeam'

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

describe('usePullCompareTotalsTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetPullCompareTotalsTeam', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockCompareData))
        }
      })
    )
  }

  describe('when usePullCompareTotalsTeam is called', () => {
    describe('api returns valid response', () => {
      it('returns compare info', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            usePullCompareTotalsTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              pullId: '12',
            }),
          { wrapper }
        )

        const expectedResult = {
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
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResult)
        )
      })
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            usePullCompareTotalsTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              pullId: '12',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toBeNull())
      })
    })
  })

  describe('returns NotFound Error __typename', () => {
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
          usePullCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: '12',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({ status: 404 })
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
          usePullCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: '12',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({ status: 403 })
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
          usePullCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: '12',
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({ status: 404 })
        )
      )
    })
  })
})
