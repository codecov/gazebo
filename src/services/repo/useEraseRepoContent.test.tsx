import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEraseRepoContent } from './useEraseRepoContent'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Route>
    </MemoryRouter>
  )

const server = setupServer()
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

describe('useEraseRepoContent', () => {
  function setup() {
    server.use(
      graphql.mutation('EraseRepository', () => {
        return HttpResponse.json({
          data: { eraseRepository: { data: null } },
        })
      })
    )
  }

  describe('when called', () => {
    describe('When success', () => {
      it('returns isSuccess true', async () => {
        setup()
        const { result } = renderHook(() => useEraseRepoContent(), {
          wrapper: wrapper(),
        })

        result.current.mutate()

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
