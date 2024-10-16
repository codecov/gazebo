import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MockInstance } from 'vitest'

import { useRepoConfig } from './useRepoConfig'

const mockRepoConfig = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          lowerRange: 60,
          upperRange: 80,
        },
      },
    },
  },
}

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

const mockUnsuccessfulParseError = {}

describe('useRepoConfig', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('RepoConfig', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        }
        return HttpResponse.json({ data: mockRepoConfig })
      })
    )
  }

  describe('calling hook', () => {
    describe('no options are passed', () => {
      it('returns the repository config', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoConfig({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            indicationRange: { lowerRange: 60, upperRange: 80 },
          })
        )
      })
    })

    describe('options are passed', () => {
      it('returns the repository config', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useRepoConfig({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              opts: {
                onSuccess: () => {},
              },
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            indicationRange: { lowerRange: 60, upperRange: 80 },
          })
        )
      })
    })
  })

  describe('hook errors', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('can return unsuccessful parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useRepoConfig({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            opts: {
              onSuccess: () => {},
            },
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })

    it('can return owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useRepoConfig({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            opts: {
              onSuccess: () => {},
            },
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
          })
        )
      )
    })
    it('can return not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useRepoConfig({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            opts: {
              onSuccess: () => {},
            },
          }),
        { wrapper }
      )

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
