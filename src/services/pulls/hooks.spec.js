import { act, renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { usePulls } from './hooks'

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
  pullId: 1,
  title: 'first pull',
  state: 'Merged',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      coverage: '90',
    },
  },
  compareWithBase: {
    patchTotals: {
      coverage: '87',
    },
  },
}

const node2 = {
  pullId: 2,
  title: 'second pull',
  state: 'Merged',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      coverage: '90',
    },
  },
  compareWithBase: {
    patchTotals: {
      coverage: '87',
    },
  },
}

const node3 = {
  pullId: 3,
  title: 'third pull',
  state: 'Merged',
  updatestamp: '20-2-2021',
  author: {
    username: 'Rula',
    avatarUrl: 'random',
  },
  head: {
    totals: {
      coverage: '90',
    },
  },
  compareWithBase: {
    patchTotals: {
      coverage: '87',
    },
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('GetPulls', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('GetPulls', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                pulls: {
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
          })
        )
      })
    )

    hookData = renderHook(() => usePulls({ provider, owner, repo }), {
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

      it('returns expected pulls nodes', () => {
        expect(hookData.result.current.data.pulls).toEqual([
          { node: node1 },
          { node: node2 },
        ])
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

    it('returns prev and next page pulls of the user', () => {
      expect(hookData.result.current.data.pulls).toEqual([
        { node: node1 },
        { node: node2 },
        { node: node3 },
      ])
    })
  })
})
