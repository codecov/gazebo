import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
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
      commit: {
        pathContents: [
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
}

const mockCommitNoContentData = {
  owner: {
    repository: {
      commit: {
        pathContents: [],
      },
    },
  },
}

const mockRepoOverviewData = {
  owner: {
    repository: {
      defaultBranch: 'main',
      branches: {
        edges: [{ node: { name: 'test', head: { commitid: '1234567' } } }],
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/commit/sha256/tree']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path={'/:provider/:owner/:repo/commit/:commitSha/tree'}>
            {children}
          </Route>
          <Route path={'/:provider/:owner/:repo/commit/:commitSha/tree/:path+'}>
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

  function setup({ noData } = { noData: false }) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverviewData))
      }),
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
          const { result, waitFor } = renderHook(
            () => useRepoCommitContentsTable(),
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
            () => useRepoCommitContentsTable(),
            {
              wrapper: wrapper([
                '/gh/test-org/test-repo/commit/sha256/tree/src/dir',
              ]),
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(3))
        })
      })

      it('sets the correct headers', async () => {
        const { result, waitFor } = renderHook(
          () => useRepoCommitContentsTable(),
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
          () => useRepoCommitContentsTable(),
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
        () => useRepoCommitContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commitSha: 'sha256',
        filters: {
          searchValue: 'file.js',
        },
        name: 'test-org',
        repo: 'test-repo',
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
        () => useRepoCommitContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalled()
      expect(calledCommitContents).toHaveBeenCalledWith({
        commitSha: 'sha256',
        filters: {
          displayType: 'LIST',
        },
        name: 'test-org',
        repo: 'test-repo',
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
        () => useRepoCommitContentsTable(),
        { wrapper: wrapper() }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      act(() => {
        result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledCommitContents).toHaveBeenCalledTimes(2)
      expect(calledCommitContents).toHaveBeenNthCalledWith(2, {
        commitSha: 'sha256',
        filters: {
          ordering: {
            direction: 'ASC',
            parameter: 'NAME',
          },
        },
        name: 'test-org',
        repo: 'test-repo',
      })
    })
  })
})
