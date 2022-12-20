import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchSingleFileComp } from './usePrefetchSingleFileComp'

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
  logger: {
    error: () => {},
  },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/pull/123']}>
    <Route path="/:provider/:owner/:repo/pull/:pullId">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const mockData = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            headName: 'file A',
            isNewFile: true,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            segments: [],
          },
        },
      },
    },
  },
}

const mockRenamedFile = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            headName: 'file A',
            isNewFile: false,
            isRenamedFile: true,
            isDeletedFile: false,
            isCriticalFile: false,
            segments: [],
          },
        },
      },
    },
  },
}

const mockDeletedFile = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            headName: 'file A',
            isNewFile: false,
            isRenamedFile: false,
            isDeletedFile: true,
            isCriticalFile: false,
            segments: [],
          },
        },
      },
    },
  },
}

const mockUnchangedFile = {
  owner: {
    repository: {
      pull: {
        compareWithBase: {
          impactedFile: {
            headName: 'file A',
            isNewFile: false,
            isRenamedFile: false,
            isDeletedFile: false,
            isCriticalFile: false,
            segments: [],
          },
        },
      },
    },
  },
}

describe('usePrefetchSingleFileComp', () => {
  function setup({
    isRenamed = false,
    isDeleted = false,
    isUnchanged = false,
  }) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) => {
        if (isRenamed) {
          return res(ctx.status(200), ctx.data(mockRenamedFile))
        } else if (isDeleted) {
          return res(ctx.status(200), ctx.data(mockDeletedFile))
        } else if (isUnchanged) {
          return res(ctx.status(200), ctx.data(mockUnchangedFile))
        }

        return res(ctx.status(200), ctx.data(mockData))
      })
    )
  }

  describe('when called with a normal pull diff', () => {
    beforeEach(() => setup({}))

    it('returns runPrefetch function', () => {
      const { result } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      const { result, waitFor } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      const { data } = queryClient.getQueryState()
      expect(data).toStrictEqual({
        fileLabel: 'New',
        headName: 'file A',
        isCriticalFile: false,
        segments: [],
      })
    })
  })

  describe('when called with a renamed file', () => {
    beforeEach(() => setup({ isRenamed: true }))

    it('returns runPrefetch function', () => {
      const { result } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      const { result, waitFor } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      const { data } = queryClient.getQueryState()
      expect(data).toStrictEqual({
        fileLabel: 'Renamed',
        headName: 'file A',
        isCriticalFile: false,
        segments: [],
      })
    })
  })

  describe('when called with a deleted file', () => {
    beforeEach(() => setup({ isDeleted: true }))

    it('returns runPrefetch function', () => {
      const { result } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      const { result, waitFor } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      const { data } = queryClient.getQueryState()
      expect(data).toStrictEqual({
        fileLabel: 'Deleted',
        headName: 'file A',
        isCriticalFile: false,
        segments: [],
      })
    })
  })

  describe('when called with a unchanged file label', () => {
    beforeEach(() => setup({ isUnchanged: true }))

    it('returns runPrefetch function', () => {
      const { result } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      const { result, waitFor } = renderHook(
        () => usePrefetchSingleFileComp({ path: 'path/to/file.js' }),
        { wrapper }
      )

      await result.current.runPrefetch()

      await waitFor(() => queryClient.getQueryState().isFetching)
      await waitFor(() => !queryClient.getQueryState().isFetching)

      const { data } = queryClient.getQueryState()
      expect(data).toStrictEqual({
        fileLabel: null,
        headName: 'file A',
        isCriticalFile: false,
        segments: [],
      })
    })
  })
})
