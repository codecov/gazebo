import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useUsers } from './hooks'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const provider = 'gh'
const owner = 'TerrySmithDC'
const query = {}

const users = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      activated: true,
      is_admin: true,
      username: 'TerrySmithDC',
      email: 'terry@codecov.io',
      ownerid: 2,
      student: false,
      name: 'Terry Smith',
      latest_private_pr_date: '2020-12-17T00:08:16.398263Z',
      lastseen: '2020-12-17T00:08:16.398263Z',
    },
  ],
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUsers', () => {
  let hookData

  function setup() {
    server.use(
      rest.get(`/internal/gh/TerrySmithDC/users/?`, (req, res, ctx) => {
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
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            activated: true,
            isAdmin: true,
            username: 'TerrySmithDC',
            email: 'terry@codecov.io',
            ownerid: 2,
            student: false,
            name: 'Terry Smith',
            latestPrivatePrDate: '2020-12-17T00:08:16.398263Z',
            lastseen: '2020-12-17T00:08:16.398263Z',
          },
        ],
      })
    })
  })
})
