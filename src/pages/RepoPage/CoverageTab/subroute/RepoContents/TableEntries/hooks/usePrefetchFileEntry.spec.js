import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider, setLogger } from 'react-query'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { usePrefetchFileEntry } from './usePrefetchFileEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

setLogger({
  log: console.log,
  warn: console.warn,
  error: () => {},
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
})
const wrapper = ({ children }) => (
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
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        flagNames: ['a', 'b'],
        coverageFile: {
          isCriticalFile: true,
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
      branch: null,
    },
  },
}

describe('usePrefetchFileEntry', () => {
  let hookData
  function setup() {
    useParams.mockReturnValue({
      provider: 'gh',
      owner: 'codecov',
      repo: 'test-repo',
    })

    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )

    hookData = renderHook(
      () => usePrefetchFileEntry({ branch: 'main', path: 'src/file.js' }),
      { wrapper }
    )
  }

  beforeEach(async () => {
    setup()
  })

  it('returns runPrefetch function', () => {
    expect(hookData.result.current.runPrefetch).toBeDefined()
    expect(typeof hookData.result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    await hookData.result.current.runPrefetch()

    await waitFor(() => queryClient.getQueryState().isFetching)

    expect(queryClient.getQueryState().data.content).toBe(
      mockData.owner.repository.commit.coverageFile.content
    )
    expect(queryClient.getQueryState().data.coverage).toStrictEqual({
      1: 1,
      2: 1,
      4: 1,
      5: 1,
      7: 1,
      8: 1,
    })
    expect(queryClient.getQueryState().data.flagNames).toStrictEqual(['a', 'b'])
    expect(queryClient.getQueryState().data.isCriticalFile).toBe(true)
    expect(queryClient.getQueryState().data.totals).toBe(0)
  })
})
