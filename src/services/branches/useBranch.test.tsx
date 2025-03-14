import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useBranch } from './useBranch'

const mockBranch = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: {
          commitid: 'commit-123',
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

describe('useBranch', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetBranch', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockBranch })
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
              useBranch({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              branch: { name: 'main', head: { commitid: 'commit-123' } },
            })
          )
        })
      })

      describe('there is a null owner', () => {
        it('returns a null value', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              useBranch({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                branch: 'main',
              }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              branch: null,
            })
          )
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
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
            useBranch({
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
              dev: 'useBranch - Not Found Error',
              status: 404,
            })
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
            useBranch({
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
              dev: 'useBranch - Owner Not Activated',
              status: 403,
            })
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

      it('throws a 400', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useBranch({
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
              dev: 'useBranch - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
