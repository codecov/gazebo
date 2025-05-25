import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteSession } from './useDeleteSession'

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

const provider = 'gh'

const server = setupServer()

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClientV5.clear()
})

afterAll(() => {
  server.close()
})

describe('useDeleteSession', () => {
  function setup() {
    server.use(
      graphql.mutation('DeleteSession', () => {
        return HttpResponse.json({ data: { deleteSession: { error: null } } })
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
