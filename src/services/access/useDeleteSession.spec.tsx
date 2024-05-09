import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteSession } from './useDeleteSession'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useDeleteSession', () => {
  function setup() {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: { me: null } }))
      })
    )
  }

  describe('when calling the mutation', () => {
    it('returns success', async () => {
      setup()
      const data = {
        sessionid: 1,
      }
      const { result } = renderHook(() => useDeleteSession({ provider }), {
        wrapper,
      })

      result.current.mutate(data)

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    })
  })
})
