import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

import { usePrefetchSingleFileComp } from './usePrefetchSingleFileComp'

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            hashedPath: 'hashed-path',
            isNewFile: true,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            changeCoverage: null,
            baseCoverage: null,
            headCoverage: null,
            patchCoverage: null,
            segments: { results: [] },
          },
        },
      },
    },
  },
}

const mockRenamedFile = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            hashedPath: 'hashed-path',
            isNewFile: false,
            isRenamedFile: true,
            isDeletedFile: false,
            isCriticalFile: false,
            changeCoverage: null,
            baseCoverage: null,
            headCoverage: null,
            patchCoverage: null,
            segments: { results: [] },
          },
        },
      },
    },
  },
}

const mockDeletedFile = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            hashedPath: 'hashed-path',
            isNewFile: false,
            isRenamedFile: false,
            isDeletedFile: true,
            isCriticalFile: false,
            changeCoverage: null,
            baseCoverage: null,
            headCoverage: null,
            patchCoverage: null,
            segments: { results: [] },
          },
        },
      },
    },
  },
}

const mockUnchangedFile = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          impactedFile: {
            headName: 'file A',
            hashedPath: 'hashed-path',
            isNewFile: false,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            changeCoverage: null,
            baseCoverage: null,
            headCoverage: null,
            patchCoverage: null,
            segments: { results: [] },
          },
        },
      },
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockDataRepositoryNotFound = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repository not found',
    },
  },
}

const mockDataOwnerNotActivated = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
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
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isRenamed?: boolean
  isDeleted?: boolean
  isUnchanged?: boolean
  isRepositoryNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('usePrefetchSingleFileComp', () => {
  function setup({
    isRenamed = false,
    isDeleted = false,
    isUnchanged = false,
    isOwnerNotActivatedError = false,
    isRepositoryNotFoundError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('ImpactedFileComparison', (info) => {
        if (isRenamed) {
          return HttpResponse.json({ data: mockRenamedFile })
        } else if (isDeleted) {
          return HttpResponse.json({ data: mockDeletedFile })
        } else if (isUnchanged) {
          return HttpResponse.json({ data: mockUnchangedFile })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockDataOwnerNotActivated })
        } else if (isRepositoryNotFoundError) {
          return HttpResponse.json({ data: mockDataRepositoryNotFound })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        }

        return HttpResponse.json({ data: mockData })
      })
    )
  }

  it('returns runPrefetch function', () => {
    setup({})
    const { result } = renderHook(
      () =>
        usePrefetchSingleFileComp({
          provider: 'gh',
          owner: 'codecov',
          pullId: '123',
          repo: 'test-repo',
          path: 'path/to/file.js',
        }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  describe('successful request', () => {
    describe('when called with a normal pull diff', () => {
      it('queries the api', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            usePrefetchSingleFileComp({
              provider: 'gh',
              owner: 'codecov',
              pullId: '123',
              repo: 'test-repo',
              path: 'path/to/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        const data = queryClient.getQueryData(queryKey)
        expect(data).toStrictEqual({
          fileLabel: 'New',
          headName: 'file A',
          hashedPath: 'hashed-path',
          isCriticalFile: false,
          segments: [],
        })
      })
    })

    describe('when called with a renamed file', () => {
      it('queries the api', async () => {
        setup({ isRenamed: true })
        const { result } = renderHook(
          () =>
            usePrefetchSingleFileComp({
              provider: 'gh',
              owner: 'codecov',
              pullId: '123',
              repo: 'test-repo',
              path: 'path/to/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        const data = queryClient.getQueryData(queryKey)
        expect(data).toStrictEqual({
          fileLabel: 'Renamed',
          headName: 'file A',
          hashedPath: 'hashed-path',
          isCriticalFile: false,
          segments: [],
        })
      })
    })

    describe('when called with a deleted file', () => {
      it('queries the api', async () => {
        setup({ isDeleted: true })
        const { result } = renderHook(
          () =>
            usePrefetchSingleFileComp({
              provider: 'gh',
              owner: 'codecov',
              pullId: '123',
              repo: 'test-repo',
              path: 'path/to/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        const data = queryClient.getQueryData(queryKey)
        expect(data).toStrictEqual({
          fileLabel: 'Deleted',
          headName: 'file A',
          hashedPath: 'hashed-path',
          isCriticalFile: false,
          segments: [],
        })
      })
    })

    describe('when called with a unchanged file label', () => {
      it('queries the api', async () => {
        setup({ isUnchanged: true })
        const { result } = renderHook(
          () =>
            usePrefetchSingleFileComp({
              provider: 'gh',
              owner: 'codecov',
              pullId: '123',
              repo: 'test-repo',
              path: 'path/to/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        const data = queryClient.getQueryData(queryKey)
        expect(data).toStrictEqual({
          fileLabel: null,
          headName: 'file A',
          hashedPath: 'hashed-path',
          isCriticalFile: false,
          segments: [],
        })
      })
    })

    describe('owner is null', () => {
      it('queries the api', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            usePrefetchSingleFileComp({
              provider: 'gh',
              owner: 'codecov',
              pullId: '123',
              repo: 'test-repo',
              path: 'path/to/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<string>

        const data = queryClient.getQueryData(queryKey)
        expect(data).toStrictEqual(null)
      })
    })
  })

  describe('rejecting request', () => {
    let consoleSpy: MockInstance
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('fails to parse bad schema', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          usePrefetchSingleFileComp({
            provider: 'gh',
            owner: 'codecov',
            pullId: '123',
            repo: 'test-repo',
            path: 'path/to/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchSingleFileComp - 404 schema parsing failed',
          })
        )
      )
    })

    it('rejects on repository not found error', async () => {
      setup({ isRepositoryNotFoundError: true })
      const { result } = renderHook(
        () =>
          usePrefetchSingleFileComp({
            provider: 'gh',
            owner: 'codecov',
            pullId: '123',
            repo: 'test-repo',
            path: 'path/to/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'usePrefetchSingleFileComp - 404 NotFoundError',
          })
        )
      )
    })

    it('rejects on owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          usePrefetchSingleFileComp({
            provider: 'gh',
            owner: 'codecov',
            pullId: '123',
            repo: 'test-repo',
            path: 'path/to/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.isFetching())

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<string>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'usePrefetchSingleFileComp - 403 OwnerNotActivatedError',
          })
        )
      )
    })
  })
})
