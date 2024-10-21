import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Cookie from 'js-cookie'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEraseAccount } from './useEraseAccount'

vi.mock('js-cookie')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const provider = 'gh'
const owner = 'codecov'

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

describe('useEraseAccount', () => {
  function setup() {
    server.use(
      http.delete(`/internal/${provider}/${owner}/account-details/`, (info) => {
        return HttpResponse.json({})
      })
    )
  }

  describe('when called', () => {
    it('deletes the auth cookie', async () => {
      setup()
      const { result } = renderHook(
        () => useEraseAccount({ provider, owner }),
        { wrapper: wrapper() }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(Cookie.remove).toHaveBeenCalledWith('github-token')
      )
    })
  })
})
