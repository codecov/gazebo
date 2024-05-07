import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

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
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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

const expectedInitialData = [
  {
    name: 'flag1',
  },
  {
    name: 'flag2',
  },
]

const nextPageData = [
  {
    node: {
      name: 'flag3',
      percentCovered: 92.95,
    },
  },
]

const expectedNextPageData = [
  {
    name: 'flag3',
  },
]

describe('FlagsSelect', () => {
  function setup() {
    server.use(
      graphql.query('FlagsSelect', (req, res, ctx) => {
        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              flags: {
                edges: req.variables.after
                  ? [...nextPageData]
                  : [...initialData],
                pageInfo: {
                  hasNextPage: !req.variables.after,
                  endCursor: req.variables.after ? 'aabb' : 'dW5pdA==',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      }),
      graphql.query('PullFlagsSelect', (req, res, ctx) => {
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
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      const { result } = renderHook(() => useRepoFlagsSelect(), {
        wrapper,
      })

      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(() => useRepoFlagsSelect(), {
          wrapper,
        })

        await waitFor(() => result.current.isSuccess)
        await waitFor(() =>
          expect(result.current.data).toEqual(expectedInitialData)
        )
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns prev and next page flags data', async () => {
      const { result } = renderHook(() => useRepoFlagsSelect(), {
        wrapper,
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toEqual([
          ...expectedInitialData,
          ...expectedNextPageData,
        ])
      )
    })
  })

  describe('when pull in params', () => {
    beforeEach(() => {
      setup()
    })

    it.only('calls the pull flag select query', async () => {
      const { result } = renderHook(() => useRepoFlagsSelect(), {
        wrapper: pullWrapper(),
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toEqual([
          {
            name: 'unit',
          },
          {
            name: 'unit-latest-uploader',
          },
        ])
      )
    })
  })
})
