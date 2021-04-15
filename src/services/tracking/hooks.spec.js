import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import { useTracking } from './hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const wrapper = ({ children }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useTracking', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useTracking(), { wrapper })
    return hookData.waitFor(() => {
      return !hookData.result.current.isFetching
    })
  }

  describe('when the user is logged-in and has all data', () => {
    const user = {
      ownerid: 1,
      yaml: { comment: 'on' },
      avatar_url: 'avatar',
      service_id: '123',
      plan: 'plan',
      staff: true,
      email: 'fake@test.com',
      name: 'Eugene Onegin',
      username: 'eugene_onegin',
      student: true,
      bot: true,
      delinquent: true,
      did_trial: true,
      private_access: true,
      plan_provider: 'provider',
      plan_user_count: 1000,
      createstamp: new Date('2017-01-01 12:00:00').toISOString(),
      updatestamp: new Date('2018-01-01 12:00:00').toISOString(),
      student_created_at: new Date('2019-01-01 12:00:00').toISOString(),
      student_updated_at: new Date('2020-01-01 12:00:00').toISOString(),
    }

    beforeEach(() => {
      server.use(
        rest.get(`/internal/profile`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(user))
        })
      )
      return setup()
    })

    it('set the user data in the dataLayer', () => {
      expect(window.dataLayer[0]).toEqual({
        codecov: {
          app: {
            version: 'react-app',
          },
          user: {
            ownerid: 1,
            has_yaml: true,
            avatar: 'avatar',
            service_id: '123',
            plan: 'plan',
            staff: true,
            email: 'fake@test.com',
            name: 'Eugene Onegin',
            username: 'eugene_onegin',
            student: true,
            bot: true,
            delinquent: true,
            did_trial: true,
            private_access: true,
            plan_provider: 'provider',
            plan_user_count: 1000,
            createdAt: new Date('2017-01-01 12:00:00').toISOString(),
            updatedAt: new Date('2018-01-01 12:00:00').toISOString(),
            student_created_at: new Date('2019-01-01 12:00:00').toISOString(),
            student_updated_at: new Date('2020-01-01 12:00:00').toISOString(),
            guest: false,
          },
        },
      })
    })
  })

  describe('when the user is logged-in but missing data', () => {
    const user = {
      ownerid: 3,
      yaml: null,
      avatar_url: 'avatar',
      service_id: '123',
      plan: 'plan',
      staff: false,
      email: null,
      name: null,
      username: null,
      student: null,
      bot: null,
      delinquent: null,
      did_trial: null,
      private_access: null,
      plan_provider: null,
      plan_user_count: null,
      createdAt: null,
      updatedAt: null,
      student_created_at: null,
      student_updated_at: null,
    }

    beforeEach(() => {
      server.use(
        rest.get(`/internal/profile`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(user))
        })
      )
      return setup()
    })

    it('set the user data in the dataLayer', () => {
      expect(window.dataLayer[0]).toEqual({
        codecov: {
          app: {
            version: 'react-app',
          },
          user: {
            ownerid: 3,
            has_yaml: false,
            avatar: 'avatar',
            service_id: '123',
            plan: 'plan',
            staff: false,
            email: 'unknown@codecov.io',
            name: 'unknown',
            username: 'unknown',
            student: false,
            bot: false,
            delinquent: false,
            did_trial: false,
            private_access: false,
            plan_provider: '',
            plan_user_count: 5,
            createdAt: new Date('2014-01-01 12:00:00').toISOString(),
            updatedAt: new Date('2014-01-01 12:00:00').toISOString(),
            student_created_at: new Date('2014-01-01 12:00:00').toISOString(),
            student_updated_at: new Date('2014-01-01 12:00:00').toISOString(),
            guest: false,
          },
        },
      })
    })
  })

  describe('when user is not logged in', () => {
    beforeEach(() => {
      server.use(
        rest.get(`/internal/profile`, (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({}))
        })
      )
      return setup()
    })

    it('set the user as guest in the dataLayer', () => {
      expect(window.dataLayer[0]).toEqual({
        codecov: {
          app: {
            version: 'react-app',
          },
          user: {
            guest: true,
          },
        },
      })
    })
  })
})
