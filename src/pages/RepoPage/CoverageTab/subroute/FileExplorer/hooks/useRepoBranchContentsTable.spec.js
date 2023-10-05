import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useRepoBranchContentsTable } from './useRepoBranchContentsTable'

const mockCommitContentData = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: {
            results: [
              {
                name: 'src',
                filePath: null,
                percentCovered: 50.0,
                type: 'dir',
                __typename: 'PathContentDir',
              },
              {
                name: 'file.ts',
                filePath: null,
                percentCovered: 50.0,
                type: 'file',
                __typename: 'PathContentFile',
              },
            ],
          },
        },
      },
    },
  },
}

const mockCommitNoContentData = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      branch: {
        head: {
          pathContents: { results: [] },
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
  (initialEntries = '/gh/test-org/test-repo/tree/main') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={'/:provider/:owner/:repo/tree/:branch'}>
            {children}
          </Route>
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
  owner: { repository: { private: false, defaultBranch: 'main' } },
}

describe('useRepoBranchContentsTable', () => {
  function setup({ noData } = { noData: false }) {
    const calledCommitContents = jest.fn()

    server.use(
      graphql.query('BranchContents', (req, res, ctx) => {
        calledCommitContents(req?.variables)

        if (noData) {
          return res(ctx.status(200), ctx.data(mockCommitNoContentData))
        }

        return res(ctx.status(200), ctx.data(mockCommitContentData))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockOverview))
      })
    )

    return { calledCommitContents }
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

      it('sets the correct headers', async () => {
        setup()
        const { result } = renderHook(() => useRepoBranchContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
        await waitFor(() => expect(queryClient.isFetching()).toBe(0))

        expect(result.current.headers.length).toBe(6)
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
      const { calledCommitContents } = setup()
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

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          searchValue: 'file.js',
          flags: [],
          ordering: {
            direction: 'ASC',
            parameter: 'NAME',
          },
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when called with the list param', () => {
    it('makes a gql request with the list param', async () => {
      const { calledCommitContents } = setup()
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

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          displayType: 'LIST',
          flags: [],
          ordering: {
            direction: 'DESC',
            parameter: 'MISSES',
          },
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when there is a flags param', () => {
    it('makes a gql request with the flags param', async () => {
      const { calledCommitContents } = setup()
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

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          flags: ['flag-1'],
          ordering: {
            direction: 'ASC',
            parameter: 'NAME',
          },
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when handleSort is triggered', () => {
    it('makes a gql request with the updated params', async () => {
      const { calledCommitContents } = setup()
      const { result } = renderHook(() => useRepoBranchContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      act(() => {
        result.current.handleSort([{ desc: true, id: 'name' }])
      })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      expect(calledCommitContents).toHaveBeenCalledTimes(2)
      expect(calledCommitContents).toHaveBeenNthCalledWith(2, {
        branch: 'main',
        filters: {
          flags: [],
          ordering: {
            direction: 'DESC',
            parameter: 'NAME',
          },
        },
        name: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })
})
