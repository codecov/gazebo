import { act, renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useCommits } from './hooks'

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

const node1 = {
  message: 'test',
  commitid: '1',
  createdAt: '2020',
  author: {
    username: 'rula',
    avatarUrl: 'random',
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
}

const node2 = {
  message: 'test2',
  commitid: '2',
  createdAt: '2021',
  author: {
    username: 'rula2',
    avatarUrl: 'random',
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
}

const node3 = {
  message: 'test3',
  commitid: '2',
  createdAt: '2020',
  author: {
    username: 'rula',
    avatarUrl: 'random',
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
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('GetCommits', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('GetCommits', (req, res, ctx) => {
        const dataReturned = {
          owner: {
            repository: {
              commits: {
                edges: req.variables.after
                  ? [
                      {
                        node: node3,
                      },
                    ]
                  : [
                      {
                        node: node1,
                      },
                      {
                        node: node2,
                      },
                    ],
                pageInfo: {
                  hasNextPage: req.variables.after ? false : true,
                  endCursor: req.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => useCommits({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
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
        expect(hookData.result.current.data.commits).toEqual([node1, node2])
      })
    })
  })

  describe('when call next page', () => {
    beforeEach(async () => {
      setup()
      await hookData.waitFor(() => hookData.result.current.isSuccess)
      await act(() => {
        return hookData.result.current.fetchNextPage()
      })
    })

    it('returns prev and next page commits of the user', () => {
      expect(hookData.result.current.data.commits).toEqual([
        node1,
        node2,
        node3,
      ])
    })
  })
})
