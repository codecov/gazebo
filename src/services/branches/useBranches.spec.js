import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranches } from './useBranches'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const branch1 = {
  name: 'branch1',
}

const branch2 = {
  name: 'branch2',
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('GetBranches', () => {
  function setup() {
    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        const branchData = !!req.variables?.after ? branch2 : branch1
        const hasNextPage = req.variables?.after ? false : true
        const endCursor = req.variables?.after ? 'second' : 'first'

        const queryData = {
          owner: {
            repository: {
              branches: {
                edges: [
                  {
                    node: branchData,
                  },
                ],
                pageInfo: {
                  hasNextPage,
                  endCursor,
                },
              },
            },
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('sets isLoading to true', () => {
      const { result } = renderHook(
        () => useBranches({ provider, owner, repo }),
        {
          wrapper,
        }
      )

      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result, waitFor } = renderHook(
          () => useBranches({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isSuccess)

        const expectedResponse = {
          branches: [
            {
              name: 'branch1',
            },
          ],
        }

        expect(result.current.data).toEqual(expectedResponse)
      })
    })
  })

  describe('when fetchNextPage is called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns old data and new data combined', async () => {
      const { result, waitFor } = renderHook(
        () => useBranches({ provider, owner, repo }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isSuccess)
      result.current.fetchNextPage()
      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      const expectedData = {
        branches: [{ name: 'branch1' }, { name: 'branch2' }],
      }

      expect(result.current.data).toStrictEqual(expectedData)
    })
  })
})
