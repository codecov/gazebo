import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from './useRepos'

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
  repositoryConfig: {
    indicationRange: {
      upperRange: 80,
      lowerRange: 60,
    },
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
  repositoryConfig: {
    indicationRange: {
      upperRange: 80,
      lowerRange: 60,
    },
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
  repositoryConfig: {
    indicationRange: {
      upperRange: 80,
      lowerRange: 60,
    },
  },
}

const repo4 = {
  name: 'python',
  active: null,
  private: false,
  coverage: null,
  updatedAt: '2021-04-22T14:09:39.826948+00:00',
  author: {
    username: 'felipe',
  },
  repositoryConfig: {
    indicationRange: {
      upperRange: 80,
      lowerRange: 60,
    },
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

  function setup(hookArgs = { filters: { active: true } }) {
    server.use(
      graphql.query('MyRepos', (req, res, ctx) => {
        const data = {
          me: {
            user: {
              username: 'febg',
            },
            viewableRepositories: {
              edges: req.variables.after
                ? [
                    {
                      node: repo4,
                    },
                  ]
                : [
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
                hasNextPage: req.variables.after ? false : true,
                endCursor: req.variables.after
                  ? 'aa'
                  : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
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

  describe('when call next page', () => {
    beforeEach(async () => {
      setup()
      await hookData.waitFor(() => hookData.result.current.isSuccess)
      hookData.result.current.fetchNextPage()
      await hookData.waitFor(() => hookData.result.current.isFetching)
      await hookData.waitFor(() => !hookData.result.current.isFetching)
    })

    it('returns repositories of the user', () => {
      expect(hookData.result.current.data).toEqual({
        repos: [repo1, repo2, repo3, repo4],
      })
    })
  })
})
