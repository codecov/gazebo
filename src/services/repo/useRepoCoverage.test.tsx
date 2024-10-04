import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MockInstance } from 'vitest'

import { useRepoCoverage } from './useRepoCoverage'

const mockRepoCoverage = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        name: 'main',
        head: {
          yamlState: 'DEFAULT',
          totals: {
            percentCovered: 70.44,
            lineCount: 90,
            hitsCount: 80,
          },
        },
      },
    },
  },
}

const mockNullBranch = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: null,
    },
  },
}

const mockRepoNotFound = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
    },
  },
}

const mockOwnerNotActivated = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
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
beforeAll(() => [server.listen()])

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  badResponse?: boolean
  isRepoNotFound?: boolean
  isOwnerNotActivated?: boolean
  nullBranch?: boolean
}

describe('useRepoCoverage', () => {
  function setup({
    badResponse = false,
    isRepoNotFound = false,
    isOwnerNotActivated = false,
    nullBranch = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoCoverage', (info) => {
        if (nullBranch) {
          return HttpResponse.json({ data: mockNullBranch })
        } else if (badResponse) {
          return HttpResponse.json({ data: {} })
        } else if (isRepoNotFound) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (isOwnerNotActivated) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        }
        return HttpResponse.json({ data: mockRepoCoverage })
      })
    )
  }

  describe('when called with valid response', () => {
    it('returns the data', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useRepoCoverage({
            provider: 'bb',
            owner: 'doggo',
            repo: 'woof',
            branch: 'main',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          name: 'main',
          head: {
            yamlState: 'DEFAULT',
            totals: {
              percentCovered: 70.44,
              lineCount: 90,
              hitsCount: 80,
            },
          },
        })
      )
    })
  })

  describe('when branch is null', () => {
    it('returns null', async () => {
      setup({ nullBranch: true })
      const { result } = renderHook(
        () =>
          useRepoCoverage({
            provider: 'bb',
            owner: 'doggo',
            repo: 'woof',
            branch: 'main',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(null)
      })
    })
  })

  describe('when invalid response returned', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with 404', async () => {
      setup({ badResponse: true })
      const { result } = renderHook(
        () =>
          useRepoCoverage({
            provider: 'bb',
            owner: 'doggo',
            repo: 'woof',
            branch: 'main',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoCoverage - 404 failed to parse',
          })
        )
      )
    })
  })

  describe('when NotFoundError returned', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with 404', async () => {
      setup({ isRepoNotFound: true })
      const { result } = renderHook(
        () =>
          useRepoCoverage({
            provider: 'bb',
            owner: 'doggo',
            repo: 'woof',
            branch: 'main',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoCoverage - 404 NotFoundError',
          })
        )
      )
    })
  })

  describe('when OwnerNotActivated returned', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('rejects with 403', async () => {
      setup({ isOwnerNotActivated: true })
      const { result } = renderHook(
        () =>
          useRepoCoverage({
            provider: 'bb',
            owner: 'doggo',
            repo: 'woof',
            branch: 'main',
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
            dev: 'useRepoCoverage - 403 OwnerNotActivated Error',
          })
        )
      )
    })
  })
})
