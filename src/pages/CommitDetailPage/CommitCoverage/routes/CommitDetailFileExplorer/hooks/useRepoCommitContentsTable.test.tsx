import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoCommitContentsTable } from './useRepoCommitContentsTable'

const mockCommitContentData = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      commit: {
        pathContents: {
          __typename: 'PathContents',
          results: [
            {
              name: 'src',
              path: null,
              percentCovered: 50.0,
              hits: 24,
              misses: 24,
              partials: 22,
              lines: 22,

              type: 'dir',
              __typename: 'PathContentDir',
            },
            {
              name: 'file.ts',
              path: null,
              percentCovered: 50.0,
              hits: 24,
              misses: 24,
              partials: 22,
              lines: 22,

              type: 'file',
              isCriticalFile: false,
              __typename: 'PathContentFile',
            },
          ],
        },
      },
    },
  },
}

const mockCommitNoContentData = {
  owner: {
    repository: {
      __typename: 'Repository',
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      commit: {
        pathContents: {
          __typename: 'PathContents',
          results: [],
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const wrapper: WrapperClosure =
  (initialEntries = ['/gh/test-org/test-repo/commit/sha256/tree']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path={'/:provider/:owner/:repo/commit/:commit/tree'}>
          {children}
        </Route>
        <Route path={'/:provider/:owner/:repo/commit/:commit/tree/:path+'}>
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

describe('useRepoCommitContentsTable', () => {
  const calledCommitContents = vi.fn()

  function setup(noData = false) {
    server.use(
      graphql.query('CommitPathContents', (info) => {
        calledCommitContents(info.variables)

        if (noData) {
          return HttpResponse.json({ data: mockCommitNoContentData })
        }

        return HttpResponse.json({ data: mockCommitContentData })
      })
    )
  }

  describe('calling the hook', () => {
    describe('when there is data to be returned', () => {
      beforeEach(() => {
        setup()
      })

      describe('on root path', () => {
        it('returns directory contents', async () => {
          const { result } = renderHook(() => useRepoCommitContentsTable(), {
            wrapper: wrapper(),
          })

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(2))
        })
      })

      describe('on child path', () => {
        it('returns directory contents', async () => {
          const { result } = renderHook(() => useRepoCommitContentsTable(), {
            wrapper: wrapper([
              '/gh/test-org/test-repo/commit/sha256/tree/src/dir',
            ]),
          })

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(3))
        })
      })
    })

    describe('when there is no data', () => {
      beforeEach(() => {
        setup(true)
      })

      it('returns an empty array', async () => {
        const { result } = renderHook(() => useRepoCommitContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(result.current.data.length).toBe(0)
      })
    })
  })

  describe('when called with the list param', () => {
    beforeEach(() => {
      setup()
    })

    it('makes a gql request with the list param', async () => {
      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/commit/sha256/tree?displayType=list',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          searchValue: '',
          displayType: 'LIST',
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
    beforeEach(() => {})

    it('makes a gql request with the flags value', async () => {
      setup()

      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/commit/sha256/tree?flags%5B0%5D=flag-1',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          displayType: 'TREE',
          searchValue: '',
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

  describe('when there is a flags and components param', () => {
    it('makes a gql request with the flags and components value', async () => {
      setup()

      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/commit/sha256/tree?flags%5B0%5D=flag-1&components%5B0%5D=component-1',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          flags: ['flag-1'],
          components: ['component-1'],
          displayType: 'TREE',
          searchValue: '',
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

  describe('when there is a search param', () => {
    it('makes a gql request with the search value', async () => {
      setup()

      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/commit/sha256/tree?search=search-val',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          displayType: 'TREE',
          searchValue: 'search-val',
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
})
