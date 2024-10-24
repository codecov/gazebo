import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from './useOwner'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
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

describe('useOwner', () => {
  function setup(dataReturned = undefined) {
    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: { owner: dataReturned } })
      })
    )
  }

  describe('when called and user is authenticated', () => {
    const codecovOrg = {
      username: 'codecov',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      isCurrentUserPartOfOrg: true,
      isAdmin: false,
    }

    it('returns the org', async () => {
      setup(codecovOrg)
      const { result } = renderHook(() => useOwner({ username: 'codecov' }), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.data).toEqual(codecovOrg))
    })
  })
})
