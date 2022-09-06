import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { useSelfHostedCurrentUser } from './useSelfHostedCurrentUser'

const user = {
  activated: false,
  email: 'codecov@codecov.io',
  isAdmin: true,
  name: 'Nicholas',
  ownerid: 2,
  username: 'codecov',
}

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

describe('useSelfHostedCurrentUser', () => {
  let hookData

  function setup() {
    server.use(
      rest.get('/internal/users/current', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(user))
      )
    )

    hookData = renderHook(() => useSelfHostedCurrentUser(), { wrapper })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(async () => {
      setup()
      await hookData.waitFor(() => hookData.result.current.isFetching)
      await hookData.waitFor(() => !hookData.result.current.isFetching)
    })

    it('returns the user info', () => {
      expect(hookData.result.current.data).toEqual(user)
    })
  })
})
