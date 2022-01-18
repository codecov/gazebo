import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useRepo } from './hooks'
import { graphql } from 'msw'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const provider = 'gh'
const owner = 'RulaKhaled'
const repo = 'test'

describe('useRepo', () => {
  afterEach(() => server.resetHandlers())

  let hookData
  let expectedResponse

  function setup() {
    server.use(
      graphql.query('GetRepo', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(expectedResponse))
      })
    )

    hookData = renderHook(() => useRepo({ provider, owner, repo }), {
      wrapper,
    })
  }

  describe('when called with successful res', () => {
    expectedResponse = {
      isPartOfOrg: true,
      repository: {
        private: true,
        uploadToken: 'token',
      },
    }
    const dataReturned = {
      owner: {
        isCurrentUserPartOfOrg: true,
        repository: {
          private: true,
          uploadToken: 'token',
        },
      },
    }

    beforeEach(() => {
      setup(dataReturned)
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

  describe('when called with unsuccessful res', () => {
    expectedResponse = null
    const dataReturned = {
      noOwnerSent: 1,
    }

    beforeEach(() => {
      setup(dataReturned)
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
