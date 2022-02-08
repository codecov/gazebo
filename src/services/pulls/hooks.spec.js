import { setupServer } from 'msw/node'
import { renderHook, act } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { usePulls } from './hooks'
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

const pullsNodes = [
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
      patchTotals: {
        coverage: '87',
      },
    },
  },
  {
    pullId: 1,
    title: 'second pull',
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
      patchTotals: {
        coverage: '87',
      },
    },
  },
]

const expectedData = {
  owner: {
    repository: {
      pulls: {
        edges: pullsNodes,
        pageInfo: {
          hasNextPage: false,
          endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
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
        return res(ctx.status(200), ctx.data(expectedData))
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
        expect(hookData.result.current.data.pulls).toEqual(pullsNodes)
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

    it('returns pulls of the user', () => {
      expect(hookData.result.current.data.pulls).toEqual(pullsNodes)
    })
  })
})
