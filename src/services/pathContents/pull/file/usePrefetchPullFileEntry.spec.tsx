import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { ReactNode } from 'react'
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
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter
    initialEntries={['/gh/codecov/test-repo/tree/main/src/file.js']}
  >
    <Route path="/:provider/:owner/:repo/tree/:branch/:path">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        flagNames: ['a', 'b'],
        coverageFile: {
          hashedPath: 'afsd',
          isCriticalFile: true,
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n\n\n\n',
          coverage: [
            {
              line: 1,
              coverage: 'H',
            },
            {
              line: 2,
              coverage: 'H',
            },
            {
              line: 4,
              coverage: 'H',
            },
            {
              line: 5,
              coverage: 'H',
            },
            {
              line: 7,
              coverage: 'H',
            },
            {
              line: 8,
              coverage: 'H',
            },
          ],
        },
      },
      branch: null,
    },
  },
}

describe('usePrefetchPullFileEntry', () => {
  function setup() {
    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  beforeEach(async () => {
    setup()
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

    const queryKey = queryClient.getQueriesData({})?.at(0)?.at(0) as Array<any>

    expect(queryClient.getQueryState(queryKey)?.data).toStrictEqual({
      hashedPath: 'afsd',
      content: mockData.owner.repository.commit.coverageFile.content,
      coverage: {
        1: 'H',
        2: 'H',
        4: 'H',
        5: 'H',
        7: 'H',
        8: 'H',
      },
      flagNames: ['a', 'b'],
      isCriticalFile: true,
      totals: 0,
    })
  })
})
