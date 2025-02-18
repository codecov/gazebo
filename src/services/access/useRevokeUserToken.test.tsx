import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRevokeUserToken } from './useRevokeUserToken'

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

interface SetupArgs {
  me: null
}

describe('useRevokeUserToken', () => {
  function setup(dataReturned: SetupArgs) {
    server.use(
      graphql.mutation('RevokeUserToken', () => {
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
