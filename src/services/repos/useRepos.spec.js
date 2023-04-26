import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from './useRepos'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const repo1 = {
  name: 'codecov-bash',
  active: true,
  lines: 99,
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
  lines: 99,
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
  function setup() {
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
  }

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup()
    })

    it('returns repositories', async () => {
      const { result, waitFor } = renderHook(
        () => useRepos({ filters: { active: true } }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          repos: [repo1, repo2, repo3],
        })
      )
    })
  })

  describe('when called for an owner', () => {
    beforeEach(() => {
      setup({
        owner: 'codecov',
      })
    })

    it('returns repositories of the owner', async () => {
      const { result, waitFor } = renderHook(
        () => useRepos({ owner: 'codecov' }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          repos: [repo1, repo2],
        })
      )
    })
  })

  describe('when call next page', () => {
    beforeEach(async () => {
      setup()
    })

    it('returns repositories of the user', async () => {
      const { result, waitFor } = renderHook(() => useRepos({}), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isSuccess)

      result.current.fetchNextPage()

      await waitFor(() =>
        expect(result.current.data).toEqual({
          repos: [repo1, repo2, repo3, repo4],
        })
      )
    })
  })
})
