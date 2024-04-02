import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
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
  seatsLimit: 10,
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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
  function setup({ invalidResponse = false }) {
    server.use(
      rest.get('/internal/settings', (req, res, ctx) => {
        if (invalidResponse) {
          return res(ctx.status(200), ctx.json({}))
        }

        return res(ctx.status(200), ctx.json(mockResponse))
      })
    )
  }

  describe('when called', () => {
    it('returns data', async () => {
      setup({})
      const { result } = renderHook(() => useSelfHostedSettings(), { wrapper })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          planAutoActivate: true,
          seatsUsed: 1,
          seatsLimit: 10,
        })
      )
    })
  })

  describe('invalid response', () => {
    beforeAll(() => {
      console.error = () => {}
    })

    it('rejects with 404', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(() => useSelfHostedSettings(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          status: 404,
          dev: 'useSelfHostedSettings - 404 schema parsing failed',
        })
      )
    })
  })
})
