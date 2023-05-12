import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'

import { useRepoBranchContentsTable } from './useRepoBranchContentsTable'

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
  (initialEntries = ['/gh/test-org/test-repo/tree/main']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
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
  const calledCommitContents = jest.fn()

  function setup({ noData } = { noData: false }) {
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
          const { result, waitFor } = renderHook(
            () => useRepoBranchContentsTable(),
            { wrapper: wrapper() }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          expect(result.current.data.length).toBe(2)
        })
      })

      describe('on child path', () => {
        it('returns directory contents', async () => {
          const { result, waitFor } = renderHook(
            () => useRepoBranchContentsTable(),
            {
              wrapper: wrapper(['/gh/test-org/test-repo/tree/main/src/dir']),
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(3))
        })
      })

      it('sets the correct headers', async () => {
        const { result, waitFor } = renderHook(
          () => useRepoBranchContentsTable(),
          { wrapper: wrapper() }
        )

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
        const { result, waitFor } = renderHook(
          () => useRepoBranchContentsTable(),
          { wrapper: wrapper() }
        )

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
      const { result, waitFor } = renderHook(
        () => useRepoBranchContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        branch: 'main',
        filters: {
          searchValue: 'file.js',
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
      const { result, waitFor } = renderHook(
        () => useRepoBranchContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
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

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      useLocationParams.mockReturnValue({
        params: {},
      })

      setup()
    })

    it('makes a gql request with the updated params', async () => {
      const { result, waitFor } = renderHook(
        () => useRepoBranchContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      act(() => {
        result.current.handleSort([{ desc: true, id: 'name' }])
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalledTimes(3)
      expect(calledCommitContents).toHaveBeenNthCalledWith(3, {
        branch: 'main',
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
