import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook, act } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useUsers, useUpdateUser } from './hooks'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUsers', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(`/internal/${provider}/${owner}/users/?`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(users))
      })
    )
    hookData = renderHook(() => useUsers({ provider, owner, query }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(() => {
      setup()
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })
    it('returns the users data', () => {
      expect(hookData.result.current.data).toEqual({
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
    })
  })
})

describe('useUpdateUser', () => {
  let hookData

  function setup(username, body, params = {}) {
    server.use(
      rest.patch(
        `/internal/${provider}/${owner}/users/${username}`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(body))
        }
      )
    )
    hookData = renderHook(() => useUpdateUser({ provider, owner, params }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      // pass mock response
      const mockRes = { ...mundo, activated: true, isAdmin: true }
      setup('mundo', mockRes)
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      describe('it updates local cache on success', () => {
        beforeEach(() => {
          return act(async () => {
            hookData.result.current.mutate({
              targetUser: 'mundo',
              admin: true,
              activated: true,
            })
            await hookData.waitFor(() => hookData.result.current.isLoading)
            await hookData.waitFor(() => !hookData.result.current.isLoading)
          })
        })

        it('the call was successful', () => {
          expect(hookData.result.current.isSuccess).toBeTruthy()
        })

        it('The local cache has been updated', () => {
          const expectedCache = {
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
                activated: true,
                isAdmin: true,
                username: 'mundo',
                email: 'drmundo@lol.com',
                ownerid: 2,
                student: false,
                name: 'Dr. Mundo',
                latestPrivatePrDate: '2020-12-17T00:08:16.398263Z',
                lastseen: '2020-12-17T00:08:16.398263Z',
              },
            ],
          }
          expect(
            queryClient.getQueryData(['users', provider, owner, {}])
          ).toMatchObject(expectedCache)
        })
      })
    })
  })
})
