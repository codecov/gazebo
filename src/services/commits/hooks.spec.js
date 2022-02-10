import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useCommits } from './hooks'
import { graphql } from 'msw'

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
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const dataReturned = {
  owner: {
    repository: {
      commits: {
        edges: [
          {
            node: {
              message: 'test',
              commitid: '1',
              createdAt: '2020',
              author: {
                username: 'rula',
              },
              totals: {
                coverage: 22,
              },
              parent: {
                totals: {
                  coverage: 22,
                },
              },
              compareWithParent: {
                patchTotals: {
                  coverage: 33,
                },
              },
            },
          },
          {
            node: {
              message: 'test2',
              commitid: '2',
              createdAt: '2021',
              author: {
                username: 'rula2',
              },
              totals: {
                coverage: 19,
              },
              parent: {
                totals: {
                  coverage: 22,
                },
              },
              compareWithParent: {
                patchTotals: {
                  coverage: 99,
                },
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    },
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('GetCommits', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('GetCommits', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => useCommits({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
    const expectedResponse = [
      {
        message: 'test',
        commitid: '1',
        createdAt: '2020',
        author: {
          username: 'rula',
        },
        totals: {
          coverage: 22,
        },
        parent: {
          totals: {
            coverage: 22,
          },
        },
        compareWithParent: {
          patchTotals: {
            coverage: 33,
          },
        },
      },
      {
        message: 'test2',
        commitid: '2',
        createdAt: '2021',
        author: {
          username: 'rula2',
        },
        totals: {
          coverage: 19,
        },
        parent: {
          totals: {
            coverage: 22,
          },
        },
        compareWithParent: {
          patchTotals: {
            coverage: 99,
          },
        },
      },
    ]

    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', () => {
        expect(hookData.result.current.data.commits).toEqual(expectedResponse)
      })
    })
  })
})
