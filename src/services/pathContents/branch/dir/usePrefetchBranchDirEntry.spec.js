import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchBranchDirEntry } from './usePrefetchBranchDirEntry'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
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
      branch: {
        head: {
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
          __typename: 'PathContents',
        },
      },
    },
  },
}

describe('usePrefetchBranchDirEntry', () => {
  function setup() {
    server.use(
      graphql.query('BranchContents', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  beforeEach(async () => {
    setup()
  })

  it('returns runPrefetch function', () => {
    const { result } = renderHook(
      () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    expect(result.current.runPrefetch).toBeDefined()
    expect(typeof result.current.runPrefetch).toBe('function')
  })

  it('queries the api', async () => {
    const { result } = renderHook(
      () => usePrefetchBranchDirEntry({ branch: 'main', path: 'src' }),
      { wrapper }
    )

    await result.current.runPrefetch()
    await waitFor(() => queryClient.getQueryState().isFetching)
    await waitFor(() => !queryClient.getQueryState().isFetching)

    expect(queryClient.getQueryState().data).toStrictEqual({
      __typename: 'PathContents',
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
