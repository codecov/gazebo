import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGenerateUserToken } from './index'
import { Z } from 'vitest/dist/chunks/reporters.C4ZHgdxQ'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
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
  function setup() {
    server.use(
      graphql.mutation(`CreateUserToken`, (info) => {
        return HttpResponse.json({ data: {me: null} })
      })
    )
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      it('returns success', async () => {
        setup()

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
