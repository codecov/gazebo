import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
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

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/flags']}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
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
    percentCovered: 93.26,
  },
  {
    name: 'flag2',
    percentCovered: 92.72,
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
    percentCovered: 92.95,
  },
]

describe('FlagsSelect', () => {
  function setup() {
    server.use(
      graphql.query('FlagsSelect', (req, res, ctx) => {
        const dataReturned = {
          owner: {
            repository: {
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
        const { result, waitFor } = renderHook(() => useRepoFlagsSelect(), {
          wrapper,
        })

        await waitFor(() => result.current.isSuccess)
        expect(result.current.data).toEqual(expectedInitialData)
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns prev and next page flags data', async () => {
      const { result, waitFor } = renderHook(() => useRepoFlagsSelect(), {
        wrapper,
      })

      await waitFor(() => result.current.isSuccess)
      result.current.fetchNextPage()

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      expect(result.current.data).toEqual([
        ...expectedInitialData,
        ...expectedNextPageData,
      ])
    })
  })
})
