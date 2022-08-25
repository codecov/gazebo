import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, useParams } from 'react-router-dom'

import { usePrefetchDirEntry } from './usePrefetchDirEntry'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}))

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
      branch: {
        head: {
          pathContents: [
            {
              __typename: 'PathContentDir',
              name: 'src',
              path: null,
              percentCovered: 0.0,
            },
          ],
        },
      },
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
      graphql.query('BranchFiles', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )

    hookData = renderHook(
      () => usePrefetchDirEntry({ branch: 'main', path: 'src' }),
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

    expect(queryClient.getQueryState().data).toStrictEqual([
      {
        __typename: 'PathContentDir',
        name: 'src',
        path: null,
        percentCovered: 0,
      },
    ])
  })
})
