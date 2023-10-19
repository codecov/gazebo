import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useReposTeam } from './useReposTeam'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/some-owner']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const repo1 = {
  name: 'codecov-bash',
  active: true,
  lines: 99,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  author: {
    username: 'codecov',
  },
}

const repo2 = {
  name: 'codecov-circleci-orb',
  active: null,
  lines: 99,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  author: {
    username: 'codecov',
  },
}

const repo3 = {
  name: 'react',
  active: null,
  private: false,
  author: {
    username: 'facebook',
  },
}

const repo4 = {
  name: 'python',
  active: null,
  private: false,
  author: {
    username: 'felipe',
  },
}

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useReposTeam', () => {
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
      graphql.query('GetReposTeam', (req, res, ctx) => {
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
      const { result } = renderHook(
        () =>
          useReposTeam({
            activated: true,
            owner: 'codecov',
            first: 2,
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          repos: [repo1, repo2, repo3],
        })
      )
    })
  })

  describe('when called', () => {
    it('returns repositories of the owner', async () => {
      const { result } = renderHook(
        () => useReposTeam({ owner: 'codecov', activated: true }),
        {
          wrapper,
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
      const { result } = renderHook(
        () =>
          useReposTeam({
            owner: 'codecov',
            activated: true,
            first: 2,
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          repos: [repo1, repo2, repo3, repo4],
        })
      )
    })
  })
})
