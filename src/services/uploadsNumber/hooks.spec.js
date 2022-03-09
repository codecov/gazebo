import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useIsUploadsNumberExceeded, useUploadsNumber } from './hooks'

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
    numberOfUploads: 252,
  },
}

const provider = 'gh'
const owner = 'codecov'

describe('GetUploadsNumber', () => {
  let hookData

  function setup() {
    server.use(
      graphql.query('GetUploadsNumber', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )

    hookData = renderHook(() => useUploadsNumber({ provider, owner }), {
      wrapper,
    })
  }

  describe('when called', () => {
    const expectedResponse = 252

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

  describe('when calling useIsUploadsNumberExceeded', () => {
    beforeEach(() => {
      setup()
      hookData = renderHook(
        () => useIsUploadsNumberExceeded({ provider, owner }),
        {
          wrapper,
        }
      )
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns true value', () => {
        expect(hookData.result.current.data).toEqual(true)
      })
    })
  })
})
