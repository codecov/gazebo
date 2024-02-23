import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepos } from './useRepos'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
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
  activated: true,
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
  latestCommitAt: null,
}

const repo2 = {
  name: 'codecov-circleci-orb',
  active: false,
  activated: true,
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
  latestCommitAt: null,
}

const repo3 = {
  name: 'react',
  activated: true,
  active: false,
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
  latestCommitAt: null,
  lines: 20,
}

const repo4 = {
  name: 'python',
  active: false,
  activated: true,
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
  latestCommitAt: null,
  lines: 29,
}

const server = setupServer()

beforeAll(() => {
  server.listen()
  jest.spyOn(global.console, 'error')
})
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => {
  server.close()
  jest.resetAllMocks()
})

describe('useRepos', () => {
  function setup({ invalidResponse = false } = {}) {
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
        return res(ctx.status(200), ctx.data(invalidResponse ? {} : data))
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
        return res(ctx.status(200), ctx.data(invalidResponse ? {} : data))
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
          useRepos({
            owner: '',
          }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => {
        expect(result.current.data?.pages).toEqual([
          {
            repos: [repo1, repo2, repo3],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
        ])
      })
    })
  })

  describe('when called for an owner', () => {
    beforeEach(() => {
      setup()
    })

    it('returns repositories of the owner', async () => {
      const { result } = renderHook(() => useRepos({ owner: 'codecov' }), {
        wrapper: wrapper(),
      })

      await waitFor(() => {
        expect(result.current.data?.pages).toEqual([
          {
            repos: [repo1, repo2],
            pageInfo: {
              hasNextPage: false,
              endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
        ])
      })
    })
  })

  describe('when call next page', () => {
    beforeEach(async () => {
      setup()
    })

    it('returns repositories of the user', async () => {
      const { result } = renderHook(() => useRepos({ owner: '' }), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => {
        expect(result.current.data?.pages).toEqual([
          {
            repos: [repo1, repo2, repo3],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
          {
            pageInfo: {
              endCursor: 'aa',
              hasNextPage: false,
            },
            repos: [repo4],
          },
        ])
      })
    })
  })

  describe('error parsing request', () => {
    it('throws an error', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(() => useRepos({ owner: '' }), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.error).toEqual(
        expect.objectContaining({ status: 404 })
      )
    })
  })

  describe('error parsing request for owner', () => {
    it('throws an error', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(() => useRepos({ owner: 'owner1' }), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.error).toEqual(
        expect.objectContaining({ status: 404 })
      )
    })
  })
})
