import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from './useIsCurrentUserAnAdmin'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path={[initialEntries]}>{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
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

describe('useIsCurrentUserAnAdmin', () => {
  function setup() {
    server.use(
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              ownerid: 123,
              username: 'cool-user',
              avatarUrl: 'http://127.0.0.1/avatar-url',
              isCurrentUserPartOfOrg: true,
              isAdmin: true,
            },
          },
        })
      })
    )
  }

  describe('when called', () => {
    it('returns boolean value', async () => {
      setup()
      const { result } = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current).toBeTruthy())
    })
  })
})
