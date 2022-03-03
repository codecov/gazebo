import { renderHook } from '@testing-library/react-hooks'
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

const dataReturned = {
  owner: {
    repository: {
      pulls: {
        edges: {
          nodes: [
            {
              pullId: 0,
              title: 'first pull',
              state: 'Merged',
              updatestamp: '20-2-2021',
              author: {
                username: 'Rula',
              },
              head: {
                totals: {
                  coverage: '90',
                },
              },
              compareWithBase: {
                changeWithParent: '65',
              },
            },
          ],
        },
      },
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
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => usePulls({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
    const expectedResponse = {
      nodes: [
        {
          pullId: 0,
          title: 'first pull',
          state: 'Merged',
          updatestamp: '20-2-2021',
          author: {
            username: 'Rula',
          },
          head: {
            totals: {
              coverage: '90',
            },
          },
          compareWithBase: {
            changeWithParent: '65',
          },
        },
      ],
    }

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
        expect(hookData.result.current.data).toEqual(expectedResponse)
      })
    })
  })
})
