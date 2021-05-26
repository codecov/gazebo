import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useRepos } from './hooks'
import { MemoryRouter, Route } from 'react-router-dom'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const repo1 = {
  name: 'codecov-bash',
  active: true,
  private: false,
  coverage: null,
  updatedAt: '2021-04-22T14:09:39.822872+00:00',
  author: {
    username: 'codecov',
  },
}

const repo2 = {
  name: 'codecov-circleci-orb',
  active: null,
  private: false,
  coverage: null,
  updatedAt: '2021-04-22T14:09:39.826948+00:00',
  author: {
    username: 'codecov',
  },
}

const repo3 = {
  name: 'react',
  active: null,
  private: false,
  coverage: null,
  updatedAt: '2021-04-22T14:09:39.826948+00:00',
  author: {
    username: 'facebook',
  },
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useRepos', () => {
  let hookData

  function setup(hookArgs = {}) {
    server.use(
      graphql.query('MyRepos', (req, res, ctx) => {
        const data = {
          me: {
            user: {
              username: 'febg',
            },
            viewableRepositories: {
              totalCount: 80,
              edges: [
                {
                  node: repo1,
                },
                {
                  node: repo2,
                },
                {
                  node: repo3,
                },
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(data))
      }),
      graphql.query('ReposForOwner', (req, res, ctx) => {
        const data = {
          owner: {
            username: 'codecov',
            repositories: {
              totalCount: 80,
              edges: [
                {
                  node: repo1,
                },
                {
                  node: repo2,
                },
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(data))
      })
    )
    hookData = renderHook(() => useRepos(hookArgs), {
      wrapper,
    })
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns repositories', () => {
      expect(hookData.result.current.data).toEqual({
        repos: [repo1, repo2, repo3],
      })
    })
  })

  describe('when called for an owner', () => {
    beforeEach(() => {
      setup({
        owner: 'codecov',
      })
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns repositories of the owner', () => {
      expect(hookData.result.current.data).toEqual({
        repos: [repo1, repo2],
      })
    })
  })
})
