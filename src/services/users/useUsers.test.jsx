import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUsers } from './useUsers'

const provider = 'lol'
const owner = 'ahri'
const query = {}

const ahri = {
  activated: true,
  is_admin: true,
  username: 'ahri',
  email: 'ahri@lol.com',
  ownerid: 1,
  student: false,
  name: 'Ahri the Nine-Tailed Fox',
  latest_private_pr_date: '2020-12-17T00:08:16.398263Z',
  lastseen: '2020-12-17T00:08:16.398263Z',
}

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

const users = {
  count: 2,
  next: null,
  previous: null,
  results: [ahri, mundo],
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/gh">{children}</Route>
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

describe('useUsers', () => {
  function setup() {
    server.use(
      http.get(`/internal/:provider/:owner/users`, (info) => {
        return HttpResponse.json(users)
      })
    )
  }

  describe('when data is loaded', () => {
    it('returns the users data', async () => {
      setup()
      const { result } = renderHook(
        () => useUsers({ provider, owner, query }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          count: 2,
          next: null,
          previous: null,
          results: [
            {
              activated: true,
              isAdmin: true,
              username: 'ahri',
              email: 'ahri@lol.com',
              ownerid: 1,
              student: false,
              name: 'Ahri the Nine-Tailed Fox',
              latestPrivatePrDate: '2020-12-17T00:08:16.398263Z',
              lastseen: '2020-12-17T00:08:16.398263Z',
            },
            {
              activated: false,
              isAdmin: false,
              username: 'mundo',
              email: 'drmundo@lol.com',
              ownerid: 2,
              student: false,
              name: 'Dr. Mundo',
              latestPrivatePrDate: '2020-12-17T00:08:16.398263Z',
              lastseen: '2020-12-17T00:08:16.398263Z',
            },
          ],
        })
      )
    })
  })
})
