import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useLocationParams } from 'services/navigation'

import { useRepoPullContentsTable } from './useRepoPullContentsTable'

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const mockPullContentData = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      pull: {
        head: {
          commitid: 'sha-123',
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

const mockPullNoContentData = {
  owner: {
    repository: {
      repositoryConfig: {
        indicationRange: {
          upperRange: 80,
          lowerRange: 60,
        },
      },
      pull: {
        head: {
          commitid: null,
          pathContents: { results: [] },
        },
      },
    },
  },
}

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/pull/123/tree']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route
            path={[
              '/:provider/:owner/:repo/pull/:pullId/tree',
              '/:provider/:owner/:repo/pull/:pullId/tree/:path+',
            ]}
          >
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

describe('useRepoPullContentsTable', () => {
  const calledPullContents = jest.fn()

  function setup({ noData } = { noData: false }) {
    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
        calledPullContents(req?.variables)

        if (noData) {
          return res(ctx.status(200), ctx.data(mockPullNoContentData))
        }

        return res(ctx.status(200), ctx.data(mockPullContentData))
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
            () => useRepoPullContentsTable(),
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
            () => useRepoPullContentsTable(),
            {
              wrapper: wrapper([
                '/gh/test-org/test-repo/pull/123/tree/src/dir',
              ]),
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(2))
        })
      })

      it('sets the correct headers', async () => {
        const { result, waitFor } = renderHook(
          () => useRepoPullContentsTable(),
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
          () => useRepoPullContentsTable(),
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
      const { result, waitFor } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledPullContents).toHaveBeenCalled()
      expect(calledPullContents).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          searchValue: 'file.js',
          ordering: {
            direction: 'ASC',
            parameter: 'NAME',
          },
        },
        owner: 'test-org',
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
      const { result, waitFor } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledPullContents).toHaveBeenCalled()
      expect(calledPullContents).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          displayType: 'LIST',
          ordering: {
            direction: 'ASC',
            parameter: 'NAME',
          },
        },
        owner: 'test-org',
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
      const { result, waitFor } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      act(() => {
        result.current.handleSort([{ desc: true, id: 'name' }])
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(calledPullContents).toHaveBeenCalledTimes(2)
      expect(calledPullContents).toHaveBeenNthCalledWith(2, {
        pullId: 123,
        filters: {
          ordering: {
            direction: 'DESC',
            parameter: 'NAME',
          },
        },
        owner: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })
})
