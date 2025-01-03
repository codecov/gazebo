import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useInfiniteQuery as useInfiniteQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { ReposTeamQueryOpts } from './ReposTeamQueryOpts'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh/some-owner']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const repo1 = {
  name: 'codecov-bash',
  active: true,
  activated: true,
  private: false,
  latestCommitAt: '2021-04-22T14:09:39.826948+00:00',
  coverageAnalytics: {
    lines: 99,
  },
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
  coverageAnalytics: {
    lines: 99,
  },
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
  coverageAnalytics: {
    lines: 99,
  },
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
  coverageAnalytics: {
    lines: 99,
  },
  author: {
    username: 'codecov',
  },
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useReposTeam', () => {
  function setup({ invalidResponse = false } = {}) {
    server.use(
      graphql.query('GetReposTeam', (info) => {
        if (invalidResponse) {
          return HttpResponse.json({})
        }

        const data = {
          owner: {
            isCurrentUserPartOfOrg: true,
            repositories: {
              edges: info.variables.after
                ? [{ node: repo3 }, { node: repo4 }]
                : [{ node: repo1 }, { node: repo2 }],
              pageInfo: {
                hasNextPage: info.variables.after ? false : true,
                endCursor: info.variables.after
                  ? 'aa'
                  : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              },
            },
          },
        }
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when called', () => {
    it('returns repositories', async () => {
      setup()
      const { result } = renderHook(
        () =>
          useInfiniteQueryV5(
            ReposTeamQueryOpts({
              provider: 'gh',
              activated: true,
              owner: 'codecov',
            })
          ),
        { wrapper }
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
          useInfiniteQueryV5(
            ReposTeamQueryOpts({
              provider: 'gh',
              activated: true,
              owner: 'codecov',
              first: 2,
            })
          ),
        { wrapper }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

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
              pageInfo: { hasNextPage: false, endCursor: 'aa' },
            },
          ],
          pageParams: [undefined, 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA='],
        })
      )
    })
  })

  describe('error parsing request for owner', () => {
    let consoleSpy: MockInstance

    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('throws an error', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(
        () =>
          useInfiniteQueryV5(
            ReposTeamQueryOpts({
              provider: 'gh',
              activated: true,
              owner: 'codecov',
              first: 2,
            })
          ),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'ReposTeamQueryOpts - 404 Failed to parse schema',
          })
        )
      )
    })
  })
})
