import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSelfHostedSettings } from './useSelfHostedSettings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockResponse = {
  planAutoActivate: true,
  seatsUsed: 1,
  seatsAvailable: 10,
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => {
  server.close()
})

describe('useSelfHostedSettings', () => {
  let hookData
  function setup() {
    server.use(
      rest.get('/internal/settings', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(mockResponse))
      )
    )

    hookData = renderHook(() => useSelfHostedSettings(), { wrapper })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    it('returns data', async () => {
      await hookData.waitFor(() => hookData.result.current.isFetching)
      await hookData.waitFor(() => !hookData.result.current.isFetching)

      expect(hookData.result.current.data).toStrictEqual({
        planAutoActivate: true,
        seatsUsed: 1,
        seatsAvailable: 10,
      })
    })
  })
})
