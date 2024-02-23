import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useRepoPullContentsTable } from './useRepoPullContentsTable'

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
          pathContents: {
            __typename: 'PathContents',
            results: [],
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
  function setup({ noData } = { noData: false }) {
    const variablesPassed = jest.fn()
    server.use(
      graphql.query('PullPathContents', (req, res, ctx) => {
        variablesPassed(req?.variables)

        if (noData) {
          return res(ctx.status(200), ctx.data(mockPullNoContentData))
        }

        return res(ctx.status(200), ctx.data(mockPullContentData))
      })
    )

    return { variablesPassed }
  }

  describe('calling the hook', () => {
    describe('when there is data to be returned', () => {
      beforeEach(() => {
        setup()
      })

      describe('on root path', () => {
        it('returns directory contents', async () => {
          const { result } = renderHook(() => useRepoPullContentsTable(), {
            wrapper: wrapper(),
          })

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(2))
        })
      })

      describe('on child path', () => {
        it('returns directory contents', async () => {
          const { result } = renderHook(() => useRepoPullContentsTable(), {
            wrapper: wrapper(['/gh/test-org/test-repo/pull/123/tree/src/dir']),
          })

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.data.length).toBe(2))
        })
      })

      it('sets the correct headers', async () => {
        const { result } = renderHook(() => useRepoPullContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(result.current.headers.length).toBe(6)
      })
    })

    describe('when there is no data', () => {
      beforeEach(() => {
        setup({ noData: true })
      })

      it('returns an empty array', async () => {
        const { result } = renderHook(() => useRepoPullContentsTable(), {
          wrapper: wrapper(),
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(result.current.data.length).toBe(0)
      })
    })
  })

  describe('when there is a search param', () => {
    it('makes a gql request with the search value', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/pull/123/tree?search=file.js',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
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
    it('makes a gql request with the list param', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/pull/123/tree?displayType=list',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          displayType: 'LIST',
          ordering: {
            direction: 'DESC',
            parameter: 'MISSES',
          },
        },
        owner: 'test-org',
        repo: 'test-repo',
        path: '',
      })
    })
  })

  describe('when called with a selected flag', () => {
    it('makes a gql request with the list param', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper(['/gh/test-org/test-repo/pull/123/tree?flags=a']),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          flags: 'a',
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

  describe('when called with a selected components', () => {
    it('makes a gql request with the list param', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/pull/123/tree?components=a,b',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          components: 'a,b',
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

  describe('when called with a selected flags and components', () => {
    it('makes a gql request with the list param', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper([
          '/gh/test-org/test-repo/pull/123/tree?flags=a&components=b',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
        pullId: 123,
        filters: {
          flags: 'a',
          components: 'b',
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
    it('makes a gql request with the updated params', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useRepoPullContentsTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      act(() => {
        result.current.handleSort([{ desc: true, id: 'name' }])
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenNthCalledWith(2, {
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
