import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useCommits } from './useCommits'

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
    avatarUrl: 'http://127.0.0.1/avatar-url',
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
    avatarUrl: 'http://127.0.0.1/avatar-url',
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
    avatarUrl: 'http://127.0.0.1/avatar-url',
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
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () => useCommits({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() =>
          expect(result.current.data.commits).toEqual([node1, node2])
        )
      })
    })

    describe('when call next page', () => {
      it('returns prev and next page commits of the user', async () => {
        const { result } = renderHook(
          () => useCommits({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        result.current.fetchNextPage()

        await waitFor(() => expect(result.current.status).toBe('success'))

        await waitFor(() =>
          expect(result.current.data.commits).toEqual([node1, node2, node3])
        )
      })
    })
  })
})
