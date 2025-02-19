import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { PrefetchBranchFileEntryCoverage } from 'services/pathContents/utils'

import { usePrefetchBranchFileEntry } from './usePrefetchBranchFileEntry'

const server = setupServer()
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
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        coverageAnalytics: {
          flagNames: ['a', 'b'],
          coverageFile: {
            content:
              'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
            coverage: [
              {
                line: 1,
                coverage: 1,
              },
              {
                line: 2,
                coverage: 1,
              },
              {
                line: 4,
                coverage: 1,
              },
              {
                line: 5,
                coverage: 1,
              },
              {
                line: 7,
                coverage: 1,
              },
              {
                line: 8,
                coverage: 1,
              },
            ],
          },
        },
      },
      branch: null,
    },
  },
}

describe('usePrefetchBranchFileEntry', () => {
  function setup() {
    server.use(
      graphql.query('CoverageForFile', () => {
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  it('returns runPrefetch function', () => {
    setup()

    const { result } = renderHook(
      () => usePrefetchBranchFileEntry({ branch: 'main', path: 'src/file.js' }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    setup()

    const { result } = renderHook(
      () => usePrefetchBranchFileEntry({ branch: 'main', path: 'src/file.js' }),
      { wrapper }
    )

    await result.current.runPrefetch()

    await waitFor(() => {
      if (queryClient.isFetching()) {
        throw new Error('still fetching')
      }
    })

    const data = queryClient.getQueryCache().getAll()[0]?.state
      .data as NonNullable<PrefetchBranchFileEntryCoverage>

    expect(data.content).toBe(
      mockData.owner.repository.commit.coverageAnalytics.coverageFile.content
    )
    expect(data.coverage).toStrictEqual({
      1: 1,
      2: 1,
      4: 1,
      5: 1,
      7: 1,
      8: 1,
    })
    expect(data.flagNames).toStrictEqual(['a', 'b'])
    expect(data.totals).toBe(0)
  })
})
