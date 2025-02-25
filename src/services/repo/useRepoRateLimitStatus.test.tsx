import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useRepoRateLimitStatus } from './useRepoRateLimitStatus'

const mockRateLimitStatus = (isGithubRateLimited: boolean) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        isGithubRateLimited,
      },
    },
  }
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
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

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
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
  isGithubRateLimited: boolean
}

describe('useRepoRateLimitStatus', () => {
  function setup({
    isGithubRateLimited = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoRateLimitStatus', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        }
        return HttpResponse.json({
          data: mockRateLimitStatus(isGithubRateLimited),
        })
      })
    )
  }

  describe('returns repository typename of Repository', () => {
    describe('there is valid data', () => {
      it('fetches the repo rate limit status', async () => {
        setup({ isGithubRateLimited: false })
        const { result } = renderHook(
          () =>
            useRepoRateLimitStatus({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            isGithubRateLimited: false,
          })
        )
      })

      describe('there is a null owner', () => {
        it('returns a null value', async () => {
          setup({ isNullOwner: true, isGithubRateLimited: false })
          const { result } = renderHook(
            () =>
              useRepoRateLimitStatus({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
              }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.data).toBeNull())
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('throws a 404', async () => {
        setup({ isNotFoundError: true, isGithubRateLimited: false })
        const { result } = renderHook(
          () =>
            useRepoRateLimitStatus({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'useRepoRateLimitStatus - Not Found Error',
              status: 404,
            })
          )
        )
      })
    })

    describe('returns OwnerNotActivatedError __typename', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })
      it('returns null', async () => {
        setup({ isOwnerNotActivatedError: true, isGithubRateLimited: false })
        const { result } = renderHook(
          () =>
            useRepoRateLimitStatus({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.data).toEqual(null))
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true, isGithubRateLimited: false })
        const { result } = renderHook(
          () =>
            useRepoRateLimitStatus({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'useRepoRateLimitStatus - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
