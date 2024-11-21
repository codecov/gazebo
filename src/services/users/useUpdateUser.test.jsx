import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateUser } from './useUpdateUser'

const provider = 'lol'
const owner = 'ahri'

const mundo = {
  activated: false,
  is_admin: false,
  username: 'mundo',
  email: 'drmundo@lol.com',
  ownerid: 2,
  student: false,
  name: 'Dr. Mundo',
  latest_private_pr_date: '2020-12-17T00:08:16.398263Z',
  lastseen: '2020-12-17T00:08:16.398263Z',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useUpdateUser', () => {
  function setup({ body }) {
    server.use(
      http.patch(`/internal/:provider/:owner/users/:ownerid`, () => {
        return HttpResponse.json(body)
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      // pass mock response
      const mockRes = { ...mundo, activated: true, isAdmin: true }
      setup({ ownerid: 11, username: 'mundo', body: mockRes })
    })

    describe('when calling the mutation', () => {
      it('updates the query', async () => {
        const { result } = renderHook(
          () => useUpdateUser({ provider, owner }),
          {
            wrapper: wrapper(),
          }
        )

        await waitFor(() =>
          result.current.mutate({
            targetUserOwnerid: 11,
            admin: true,
            activated: true,
          })
        )

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })

  describe('onSuccess handler', () => {
    const mockSuccess = vi.fn()
    beforeEach(() => {
      // pass mock response
      const mockRes = 'new account details data'
      setup({
        username: 'mundo',
        ownerid: 1,
        body: mockRes,
      })
    })

    describe('passes through the on success passed function', () => {
      it('calls the onSuccess method', async () => {
        const { result } = renderHook(
          () =>
            useUpdateUser({
              provider,
              owner,
              opts: { onSuccess: mockSuccess },
            }),
          {
            wrapper: wrapper(),
          }
        )

        await waitFor(() =>
          result.current.mutate({
            targetUserOwnerid: 1,
            admin: true,
            activated: true,
          })
        )

        await waitFor(() => expect(mockSuccess).toHaveBeenCalledTimes(1))
      })
    })
  })
})
