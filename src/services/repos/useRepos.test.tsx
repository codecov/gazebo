import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { useRepos } from './useRepos'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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
  coverageAnalytics: {
    lines: 99,
    percentCovered: null,
  },
  private: false,
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
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const repo2 = {
  name: 'codecov-circleci-orb',
  active: false,
  activated: true,
  coverageAnalytics: {
    lines: 99,
    percentCovered: null,
  },
  private: false,
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
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
}

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useRepos', () => {
  function setup({ invalidResponse = false } = {}) {
    server.use(
      graphql.query('ReposForOwner', (info) => {
        if (invalidResponse) {
          return HttpResponse.json({})
        }

        const data = {
          owner: {
            username: 'codecov',
            repositories: {
              edges: info.variables.after
                ? [
                    {
                      node: repo2,
                    },
                  ]
                : [
                    {
                      node: repo1,
                    },
                  ],
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

  it('returns repositories of the owner', async () => {
    setup()
    const { result } = renderHook(
      () => useRepos({ provider: '', owner: 'codecov' }),
      {
        wrapper: wrapper(),
      }
    )

    await waitFor(() => {
      expect(result.current.data?.pages).toEqual([
        {
          repos: [repo1],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
          },
        },
      ])
    })
  })

  describe('when calling next page', () => {
    it('returns next set of repositories', async () => {
      setup()
      const { result } = renderHook(
        () => useRepos({ provider: '', owner: '' }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => {
        expect(result.current.data?.pages).toEqual([
          {
            repos: [repo1],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
            },
          },
          {
            pageInfo: { endCursor: 'aa', hasNextPage: false },
            repos: [repo2],
          },
        ])
      })
    })
  })

  describe('error parsing request for owner', () => {
    let consoleErrorSpy: MockInstance
    beforeAll(() => {
      consoleErrorSpy = vi
        .spyOn(global.console, 'error')
        .mockImplementation(() => {})
    })

    afterAll(() => {
      consoleErrorSpy.mockRestore()
    })

    it('throws an error', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(
        () => useRepos({ provider: '', owner: 'owner1' }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({ status: 404 })
        )
      )
    })
  })
})
