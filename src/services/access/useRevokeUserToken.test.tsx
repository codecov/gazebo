import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRevokeUserToken } from './index'

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

interface SetupArgs {
  me: null
}

describe('useRevokeUserToken', () => {
  function setup(dataReturned: SetupArgs) {
    server.use(
      graphql.mutation('RevokeUserToken', (info) => {
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      it('returns success', async () => {
        setup({ me: null })
        const { result } = renderHook(() => useRevokeUserToken({ provider }), {
          wrapper,
        })

        result.current.mutate({ tokenid: '1' })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
