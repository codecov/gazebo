import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSelfHostedSeatsConfig } from './useSelfHostedSeatsConfig'

const mockData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSelfHostedSeatsConfig', () => {
  function setup() {
    server.use(
      graphql.query('Seats', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data', async () => {
      const { result } = renderHook(() => useSelfHostedSeatsConfig(), {
        wrapper,
      })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          seatsUsed: 5,
          seatsLimit: 10,
        })
      )
    })
  })
})
