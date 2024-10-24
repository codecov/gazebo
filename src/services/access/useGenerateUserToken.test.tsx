import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGenerateUserToken } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
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

describe('useGenerateUserToken', () => {
  function setup(dataReturned) {
    server.use(
      graphql.mutation(`CreateUserToken`, (info) => {
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      it('returns success', async () => {
        setup({ me: null })

        const { result } = renderHook(
          () => useGenerateUserToken({ provider }),
          { wrapper }
        )

        result.current.mutate({ sessionid: 1 })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
