import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

import { useCompareTotalsTeam } from './useCompareTotalsTeam'

const mockCompareData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          state: 'processed',
          patchTotals: {
            coverage: 100,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              { headName: 'src/App.tsx', patchCoverage: { coverage: 100 } },
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

describe('useCompareTotalsTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetCompareTotalsTeam', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockCompareData })
        }
      })
    )
  }

  describe('when useCompareTotalsTeam is called', () => {
    describe('api returns valid response', () => {
      it('returns compare info', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useCompareTotalsTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitid: 's2h5a6',
            }),
          { wrapper }
        )

        const expectedResult = {
          compareWithParent: {
            __typename: 'Comparison',
            impactedFiles: {
              __typename: 'ImpactedFiles',
              results: [
                {
                  headName: 'src/App.tsx',
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
            useCompareTotalsTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitid: 's2h5a6',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toBeNull())
      })
    })
  })

  describe('returns NotFound Error __typename', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 's2h5a6',
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 's2h5a6',
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useCompareTotalsTeam({
            provider: 'gh',
            owner: 'codecov',
            repo: 'test-repo',
            commitid: 's2h5a6',
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
