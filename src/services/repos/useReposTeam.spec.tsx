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
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const repo1 = {
  name: 'codecov-bash',
  active: true,
  activated: true,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  lines: 99,
  author: {
    username: 'codecov',
  },
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const repo2 = {
  name: 'codecov-bash-2',
  active: true,
  activated: true,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  lines: 99,
  author: {
    username: 'codecov',
  },
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const repo3 = {
  name: 'codecov-bash-3',
  active: true,
  activated: true,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  lines: 99,
  author: {
    username: 'codecov',
  },
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const repo4 = {
  name: 'codecov-bash-4',
  active: true,
  activated: true,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  lines: 99,
  author: {
    username: 'codecov',
  },
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
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

describe('useReposTeam', () => {
  function setup({ invalidResponse = false } = {}) {
    server.use(
      graphql.query('GetReposTeam', (req, res, ctx) => {
        if (invalidResponse) {
          return res(ctx.status(200), ctx.data({}))
        }

        const data = {
          owner: {
            isCurrentUserPartOfOrg: true,
            repositories: {
              edges: req.variables.after
                ? [
                    {
                      node: repo3,
                    },
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
      })
    )
  }

  describe('when called', () => {
    it('returns repositories', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useReposTeam({
            activated: true,
            owner: 'codecov',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          pages: [
            {
              repos: [repo1, repo2],
              isCurrentUserPartOfOrg: true,
              pageInfo: {
                hasNextPage: true,
                endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              },
            },
          ],
          pageParams: [undefined],
        })
      )
    })
  })

  describe('when call next page', () => {
    it('returns repositories of the user', async () => {
      setup()
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
          pages: [
            {
              repos: [repo1, repo2],
              isCurrentUserPartOfOrg: true,
              pageInfo: {
                hasNextPage: true,
                endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              },
            },
            {
              repos: [repo3, repo4],
              isCurrentUserPartOfOrg: true,
              pageInfo: {
                hasNextPage: false,
                endCursor: 'aa',
              },
            },
          ],
          pageParams: [undefined, 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA='],
        })
      )
    })
  })

  describe('error parsing request for owner', () => {
    it('throws an error', async () => {
      setup({ invalidResponse: true })
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

      await waitFor(() => expect(result.current.isError).toBeTruthy())

      expect(result.current.error).toEqual(
        expect.objectContaining({ status: 404 })
      )
    })
  })
})
