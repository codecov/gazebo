import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useServerStatus, StatusUrl } from './hooks'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useServerStatus', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(StatusUrl, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            status: { indicator: 'a status', description: 'description' },
          })
        )
      })
    )
    hookData = renderHook(() => useServerStatus(), { wrapper })
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
        expect(hookData.result.current.data).toStrictEqual({
          indicator: 'a status',
          description: 'description',
        })
      })
    })
  })
})
