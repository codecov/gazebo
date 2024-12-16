import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBranchContentsTable } from './useRepoBranchContentsTable'

const mockBranchContentData = {
  owner: {
    username: 'cool-user',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: [
              {
                node: {
                  hits: 9,
                  misses: 0,
                  partials: 0,
                  lines: 10,
                  name: 'src',
                  path: 'src',
                  percentCovered: 100.0,
                  __typename: 'PathContentDir',
                },
              },
              {
                node: {
                  hits: 9,
                  misses: 0,
                  partials: 0,
                  lines: 10,
                  name: 'file.ts',
                  path: 'src/file.ts',
                  percentCovered: 100.0,
                  isCriticalFile: false,
                  __typename: 'PathContentFile',
                },
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    },
  },
}

const mockCommitNoContentData = {
  owner: {
    username: 'cool-user',
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          deprecatedPathContents: {
            __typename: 'PathContentConnection',
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo/tree/main'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={'/:provider/:owner/:repo/tree/:branch'}>{children}</Route>
        <Route path={'/:provider/:owner/:repo/tree/:branch/:path+'}>
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: [],
      testAnalyticsEnabled: true,
    },
  },
}

describe('useRepoBranchContentsTable', () => {
  function setup({ noData } = { noData: false }) {
    const calledBranchContents = vi.fn()

    server.use(
      graphql.query('BranchContents', (info) => {
        calledBranchContents(info?.variables)

        if (noData) {
          return HttpResponse.json({ data: mockCommitNoContentData })
        }

        return HttpResponse.json({ data: mockBranchContentData })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview })
      })
    )

    return { calledBranchContents }
  }

  describe('calling the hook', () => {
    describe('when there is data to be returned', () => {
      describe('on root path', () => {
        it('returns directory contents', async () => {
          setup()
          const { result } = renderHook(() => useRepoBranchContentsTable(), {
            wrapper: wrapper(),
          })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          await waitFor(() => expect(result.current.data.length).toBe(2))
        })
      })

      describe('on child path', () => {
        it('returns directory contents', async () => {
          setup()
          const { result } = renderHook(() => useRepoBranchContentsTable(), {
            wrapper: wrapper('/gh/test-org/test-repo/tree/main/src/dir'),
          })

          await waitFor(() =>
            expect(queryClient.isFetching()).toBeGreaterThan(0)
          )
          await waitFor(() => expect(queryClient.isFetching()).toBe(0))

          await waitFor(() => expect(result.current.data.length).toBe(3))
        })
      })
    })

    describe('when there is no data', () => {
      it('returns an empty array', async () => {
        setup({ noData: true })
        const { result } = renderHook(() => useRepoBranchContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(result.current.data.length).toBe(0)
      })
    })
  })

  describe('when there is a search param', () => {
    it('makes a gql request with the search value', async () => {
      const { calledBranchContents } = setup()
      renderHook(() => useRepoBranchContentsTable(), {
        wrapper: wrapper(
          `/gh/test-org/test-repo/tree/main${qs.stringify(
            { search: 'file.js' },
            { addQueryPrefix: true }
          )}`
        ),
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(calledBranchContents).toHaveBeenCalled()
      expect(calledBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          searchValue: 'file.js',
          displayType: 'LIST',
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when called with the list param', () => {
    it('makes a gql request with the list param', async () => {
      const { calledBranchContents } = setup()
      renderHook(() => useRepoBranchContentsTable(), {
        wrapper: wrapper(
          `/gh/test-org/test-repo/tree/main${qs.stringify(
            { displayType: 'list' },
            { addQueryPrefix: true }
          )}`
        ),
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(calledBranchContents).toHaveBeenCalled()
      expect(calledBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          displayType: 'LIST',
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when there is a flags param', () => {
    it('makes a gql request with the flags param', async () => {
      const { calledBranchContents } = setup()
      renderHook(() => useRepoBranchContentsTable(), {
        wrapper: wrapper(
          `/gh/test-org/test-repo/tree/main${qs.stringify(
            { flags: ['flag-1'] },
            { addQueryPrefix: true }
          )}`
        ),
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(calledBranchContents).toHaveBeenCalled()
      expect(calledBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          flags: ['flag-1'],
          displayType: 'TREE',
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when there is a components param', () => {
    it('makes a gql request with the components param', async () => {
      const { calledBranchContents } = setup()
      renderHook(() => useRepoBranchContentsTable(), {
        wrapper: wrapper(
          `/gh/test-org/test-repo/tree/main${qs.stringify(
            { components: ['component-1'] },
            { addQueryPrefix: true }
          )}`
        ),
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(calledBranchContents).toHaveBeenCalled()
      expect(calledBranchContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          components: ['component-1'],
          displayType: 'TREE',
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })
})
