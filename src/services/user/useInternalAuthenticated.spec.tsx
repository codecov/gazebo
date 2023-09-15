import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { useInternalAuthenticated } from './useInternalAuthenticated'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useInternalAuthenticated', () => {
  function setup() {
    server.use(
      rest.get('/internal/authenticated', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            authenticated: true,
          })
        )
      })
    )
  }

  describe('calling hook', () => {
    it('returns api response', async () => {
      setup()

      const { result } = renderHook(() => useInternalAuthenticated({}), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          authenticated: true,
        })
      )
    })
  })
})
