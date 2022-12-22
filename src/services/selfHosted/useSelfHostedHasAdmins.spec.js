import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useSelfHostedHasAdmins } from './useSelfHostedHasAdmins'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSelfHostedHasAdmins', () => {
  let hookData

  function setup({ data, provider = 'gl' }) {
    server.use(
      graphql.query('HasAdmins', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )

    hookData = renderHook(() => useSelfHostedHasAdmins({ provider }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({ data: { config: { hasAdmins: true } } })
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(async () => {
      setup({ data: { config: { hasAdmins: true } } })
      await hookData.waitFor(() => hookData.result.current.isFetching)
      await hookData.waitFor(() => !hookData.result.current.isFetching)
    })

    it('returns the user info', () => {
      expect(hookData.result.current.data).toEqual(true)
    })
  })
})
