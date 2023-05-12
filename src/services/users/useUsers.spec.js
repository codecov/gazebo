import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
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
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/gh">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUsers', () => {
  function setup() {
    server.use(
      rest.get(`/internal/:provider/:owner/users`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(users))
      })
    )
  }

  describe('when data is loaded', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the users data', async () => {
      const { result, waitFor } = renderHook(
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
