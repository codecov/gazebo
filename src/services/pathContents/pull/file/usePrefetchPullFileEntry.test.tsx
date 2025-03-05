import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchPullFileEntry } from './usePrefetchPullFileEntry'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter
    initialEntries={['/gh/codecov/test-repo/tree/main/src/file.js']}
  >
    <Route path="/:provider/:owner/:repo/tree/:branch/:path">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        coverageAnalytics: {
          flagNames: ['a', 'b'],
          components: [],
          coverageFile: {
            hashedPath: 'afsd',
            content:
              'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
            coverage: [
              { line: 1, coverage: 'H' },
              { line: 2, coverage: 'H' },
              { line: 4, coverage: 'H' },
              { line: 5, coverage: 'H' },
              { line: 7, coverage: 'H' },
              { line: 8, coverage: 'H' },
            ],
            totals: {
              percentCovered: 100,
            },
          },
        },
      },
      branch: null,
    },
  },
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

describe('usePrefetchPullFileEntry', () => {
  function setup({
    invalidSchema = false,
    repositoryNotFound = false,
    ownerNotActivated = false,
    nullOwner = false,
  }) {
    server.use(
      graphql.query('CoverageForFile', () => {
        if (invalidSchema) {
          return HttpResponse.json({})
        } else if (repositoryNotFound) {
          return HttpResponse.json({ data: mockDataRepositoryNotFound })
        } else if (ownerNotActivated) {
          return HttpResponse.json({ data: mockDataOwnerNotActivated })
        } else if (nullOwner) {
          return HttpResponse.json({ data: { owner: null } })
        }
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  beforeEach(async () => {
    setup({})
  })

  it('returns runPrefetch function', () => {
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
        }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
        }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => queryClient.isFetching())

    const queryKey = queryClient
      .getQueriesData({})
      ?.at(0)
      ?.at(0) as Array<string>

    expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
      hashedPath: 'afsd',
      content:
        mockData.owner.repository.commit.coverageAnalytics.coverageFile.content,
      coverage: {
        1: 'H',
        2: 'H',
        4: 'H',
        5: 'H',
        7: 'H',
        8: 'H',
      },
      flagNames: ['a', 'b'],
      componentNames: [],
      totals: 100,
    })
  })

  it('fails to parse bad schema', async () => {
    setup({ invalidSchema: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
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
          dev: 'usePrefetchPullFileEntry - Parsing Error',
          status: 400,
        })
      )
    )
  })

  it('rejects on repository not found error', async () => {
    setup({ repositoryNotFound: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
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
          dev: 'usePrefetchPullFileEntry - Not Found Error',
          status: 404,
        })
      )
    )
  })

  it('rejects on owner not activated error', async () => {
    setup({ ownerNotActivated: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
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
          dev: 'usePrefetchPullFileEntry - Owner Not Activated',
          status: 403,
        })
      )
    )
  })

  it('rejects when cannot extract coverage from response', async () => {
    setup({ nullOwner: true })
    const { result } = renderHook(
      () =>
        usePrefetchPullFileEntry({
          ref: 'f00162848a3cebc0728d915763c2fd9e92132408',
          path: 'src/file.js',
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
      expect(queryClient?.getQueryState(queryKey)?.error).toBeNull()
    )
  })
})
