import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchCommitDirEntry } from './usePrefetchCommitDirEntry'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/test-repo/tree/main/src']}>
    <Route path="/:provider/:owner/:repo/tree/:branch/:path+">
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
    username: 'codecov',
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      commit: {
        pathContents: {
          results: [
            {
              __typename: 'PathContentDir',
              name: 'src',
              path: null,
              percentCovered: 0.0,
              hits: 4,
              misses: 2,
              lines: 7,
              partials: 1,
            },
          ],
        },
      },
    },
  },
}

describe('usePrefetchCommitDirEntry', () => {
  function setup() {
    server.use(
      graphql.query('CommitPathContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  beforeEach(async () => {
    setup()
  })

  it('returns runPrefetch function', () => {
    const { result } = renderHook(
      () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    const { result, waitFor } = renderHook(
      () => usePrefetchCommitDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    await result.current.runPrefetch()
    await waitFor(() => queryClient.getQueryState().isFetching)
    await waitFor(() => !queryClient.getQueryState().isFetching)

    expect(queryClient.getQueryState().data).toStrictEqual({
      indicationRange: {
        upperRange: 80,
        lowerRange: 60,
      },
      results: [
        {
          __typename: 'PathContentDir',
          name: 'src',
          path: null,
          percentCovered: 0,
          hits: 4,
          misses: 2,
          lines: 7,
          partials: 1,
        },
      ],
    })
  })
})
