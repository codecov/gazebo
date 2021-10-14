import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useRepo } from './hooks'
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
      private: true,
      uploadToken: 'token',
    },
  },
}

const provider = 'gh'
const owner = 'RulaKhaled'
const repo = 'test'

describe('getRepo', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => useRepo({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called', () => {
    const expectedResponse = {
      private: true,
      uploadToken: 'token',
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
