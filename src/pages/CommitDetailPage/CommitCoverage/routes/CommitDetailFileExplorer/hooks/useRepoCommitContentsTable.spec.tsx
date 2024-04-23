import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'

import { useRepoCommitContentsTable } from './useRepoCommitContentsTable'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))
const mockedUseLocationParams = useLocationParams as jest.Mock

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
  ({ children }) =>
    (
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
  const calledCommitContents = jest.fn()

  function setup(noData = false) {
    server.use(
      graphql.query('CommitPathContents', (req, res, ctx) => {
        calledCommitContents(req?.variables)

        if (noData) {
          return res(ctx.status(200), ctx.data(mockCommitNoContentData))
        }

        return res(ctx.status(200), ctx.data(mockCommitContentData))
      })
    )
  }

  describe('calling the hook', () => {
    describe('when there is data to be returned', () => {
      beforeEach(() => {
        mockedUseLocationParams.mockReturnValue({
          params: {},
        })

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
        mockedUseLocationParams.mockReturnValue({
          params: {},
        })

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
      mockedUseLocationParams.mockReturnValue({
        search: { displayType: 'list' },
      })
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

  // Resume here
  // Add search tests in the big file, then update hook
  describe('when there is a flags param', () => {
    beforeEach(() => {
      mockedUseLocationParams.mockReturnValue({
        params: { flags: ['flag-1'] },
      })
    })

    it('makes a gql request with the flags value', async () => {
      setup()

      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
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

  describe('when there is a flags and components param', () => {
    beforeEach(() => {
      mockedUseLocationParams.mockReturnValue({
        params: { flags: ['flag-1'], components: ['component-1'] },
      })
    })

    it('makes a gql request with the flags and components value', async () => {
      setup()

      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          flags: ['flag-1'],
          components: ['component-1'],

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

  describe('sorting might not need this', () => {
    beforeEach(() => {
      mockedUseLocationParams.mockReturnValue({
        params: {},
      })

      setup()
    })

    it('makes a gql request with the updated params', async () => {
      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalledTimes(2)
      expect(calledCommitContents).toHaveBeenNthCalledWith(2, {
        commit: 'sha256',
        filters: {
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
