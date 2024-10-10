import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { useRepoFlagsSelect } from './useRepoFlagsSelect'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>

const pullWrapper: WrapperClosure =
  (initialEntries = ['/gh/codecov/gazebo/pull/123']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

const initialData = [
  {
    node: {
      name: 'flag1',
      percentCovered: 93.26,
    },
  },
  {
    node: {
      name: 'flag2',
      percentCovered: 92.72,
    },
  },
]

const invalidData = [
  {
    node: {
      defaultBranch: 'main',
    },
  },
]

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const expectedInitialData = [{ name: 'flag1' }, { name: 'flag2' }]

const nextPageData = [
  {
    node: {
      name: 'flag3',
      percentCovered: 92.95,
    },
  },
]

const expectedNextPageData = [{ name: 'flag3' }]

describe('FlagsSelect', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isOwnerNotActivatedError = false,
    isNotFoundError = false,
  }) {
    server.use(
      graphql.query('FlagsSelect', (info) => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: invalidData })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              coverageAnalytics: {
                flags: {
                  edges: info.variables.after
                    ? [...nextPageData]
                    : [...initialData],
                  pageInfo: {
                    hasNextPage: !info.variables.after,
                    endCursor: info.variables.after ? 'aabb' : 'dW5pdA==',
                  },
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      }),
      graphql.query('PullFlagsSelect', (info) => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: invalidData })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              pull: {
                compareWithBase: {
                  __typename: 'Comparison',
                  flagComparisons: [
                    {
                      name: 'unit',
                    },
                    {
                      name: 'unit-latest-uploader',
                    },
                  ],
                },
              },
            },
          },
        }
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('successful response', () => {
      describe('when data is loaded', () => {
        it('returns the data', async () => {
          setup({})
          const { result } = renderHook(() => useRepoFlagsSelect(), {
            wrapper,
          })

          await waitFor(() =>
            expect(result.current.data).toEqual(expectedInitialData)
          )
        })
      })
    })

    describe('when unsuccessful response', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('checks the parsed response', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper,
        })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })

      it('throws a not found error', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper,
        })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
              data: {},
              dev: 'useRepoFlagsSelect - 404 NotFoundError',
            })
          )
        )
      })

      it('throws an owner not activated error', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper,
        })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
              dev: 'useRepoFlagsSelect - 403 OwnerNotActivatedError',
            })
          )
        )
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    it('returns prev and next page flags data', async () => {
      setup({})
      const { result } = renderHook(() => useRepoFlagsSelect(), {
        wrapper,
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() =>
        expect(result.current.data).toEqual([
          ...expectedInitialData,
          ...expectedNextPageData,
        ])
      )
    })
  })

  describe('when pull in params', () => {
    it('calls the pull flag select query', async () => {
      setup({})
      const { result } = renderHook(() => useRepoFlagsSelect(), {
        wrapper: pullWrapper(),
      })

      await waitFor(() =>
        expect(result.current.data).toEqual([
          { name: 'unit' },
          { name: 'unit-latest-uploader' },
        ])
      )
    })

    describe('when unsuccessful response', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('checks the parsed response', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper: pullWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })

      it('throws a not found error', async () => {
        setup({ isNotFoundError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper: pullWrapper(),
        })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
              data: {},
              dev: 'useRepoFlagsSelect - 404 NotFoundError',
            })
          )
        )
      })

      it('throws an owner not activated error', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper: pullWrapper(),
        })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 403,
              dev: 'useRepoFlagsSelect - 403 OwnerNotActivatedError',
            })
          )
        )
      })
    })
  })
})
