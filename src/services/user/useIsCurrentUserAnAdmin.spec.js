import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin } from './useIsCurrentUserAnAdmin'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={[initialEntries]}>{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
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
      graphql.query('DetailOwner', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              orgUploadToken: 'token',
              hashOwnerid: true,
              username: 'cool-user',
              avatarUrl: 'url',
              isCurrentUserPartOfOrg: true,
              isAdmin: true,
            },
          })
        )
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => setup())

    it('returns boolean value', async () => {
      const { result, waitFor } = renderHook(
        () => useIsCurrentUserAnAdmin({ owner: 'codecov' }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current).toBeTruthy())
    })
  })
})
