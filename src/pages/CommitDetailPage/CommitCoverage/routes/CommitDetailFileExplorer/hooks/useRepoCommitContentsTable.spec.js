import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'

import { useRepoCommitContentsTable } from './useRepoCommitContentsTable'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const mockCommitContentData = {
  owner: {
    repository: {
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

const wrapper =
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

  function setup({ noData = false } = { noData: false }) {
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
        useLocationParams.mockReturnValue({
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

      it('sets the correct headers', async () => {
        const { result } = renderHook(() => useRepoCommitContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(result.current.headers.length).toBe(6)
      })
    })

    describe('when there is no data', () => {
      beforeEach(() => {
        useLocationParams.mockReturnValue({
          params: {},
        })

        setup({ noData: true })
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

  describe('when there is a search param', () => {
    beforeEach(() => {
      useLocationParams.mockReturnValue({
        params: { search: 'file.js' },
      })

      setup()
    })

    it('makes a gql request with the search value', async () => {
      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
          searchValue: 'file.js',
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
    beforeEach(() => {
      useLocationParams.mockReturnValue({
        params: { displayType: 'list' },
      })

      setup()
    })

    it('makes a gql request with the list param', async () => {
      const { result } = renderHook(() => useRepoCommitContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commit: 'sha256',
        filters: {
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
    beforeEach(() => {
      useLocationParams.mockReturnValue({
        params: { flags: ['flag-1'] },
      })
    })

    it('makes a gql request with the flags value', async () => {
      setup({})

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
      useLocationParams.mockReturnValue({
        params: { flags: ['flag-1'], components: ['component-1'] },
      })
    })

    it('makes a gql request with the flags and components value', async () => {
      setup({})

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

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      useLocationParams.mockReturnValue({
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

      act(() => {
        result.current.handleSort([{ desc: true, id: 'name' }])
      })

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
