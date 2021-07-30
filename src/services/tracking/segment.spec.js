import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useSegmentUser } from './segment'

window.analytics = {
  identify: jest.fn(),
}

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

describe('useSegmentUser', () => {
  let hookData

  function setup() {
    hookData = renderHook(() => useSegmentUser(), { wrapper })
    return hookData.waitFor(() => {
      return !hookData.result.current.isFetching
    })
  }

  describe('when the user is logged-in and has all data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 1,
        serviceId: '123',
        plan: 'plan',
        staff: true,
        service: 'github',
      },
      user: {
        name: 'Test User',
        username: 'test_user',
      },
      email: 'tedlasso@test.com',
    }

    beforeEach(() => {
      server.use(
        graphql.query('CurrentUser', (req, res, ctx) => {
          return res(ctx.status(200), ctx.data({ me: user }))
        })
      )
      return setup()
    })

    it('set the user data in the dataLayer', () => {
      window.analytics.identify.mockReturnValue({ data: user })
      console.log(window.analytics.identify)
      // expect(window.dataLayer[0]).toEqual({
      //   codecov: {
      //     app: {
      //       version: 'react-app',
      //     },
      //     user: {
      //       ownerid: 1,
      //       has_yaml: true,
      //       avatar: 'avatar',
      //       service_id: '123',
      //       plan: 'plan',
      //       staff: true,
      //       email: 'lasso@test.com',
      //       name: 'Ted Lasso',
      //       username: 'ted_lasso',
      //       student: true,
      //       bot: true,
      //       delinquent: true,
      //       did_trial: true,
      //       private_access: true,
      //       plan_provider: 'provider',
      //       plan_user_count: 1000,
      //       service: 'github',
      //       created_at: new Date('2017-01-01 12:00:00').toISOString(),
      //       updated_at: new Date('2018-01-01 12:00:00').toISOString(),
      //       student_created_at: new Date('2019-01-01 12:00:00').toISOString(),
      //       student_updated_at: new Date('2020-01-01 12:00:00').toISOString(),
      //       guest: false,
      //     },
      //   },
      // })
    })
  })

  // describe('when the user is logged-in but missing data', () => {
  //   const user = {
  //     trackingMetadata: {
  //       ownerid: 3,
  //       hasYaml: false,
  //       serviceId: '123',
  //       service: 'github',
  //       plan: 'plan',
  //       staff: false,
  //       bot: null,
  //       delinquent: null,
  //       didTrial: null,
  //       planProvider: null,
  //       planUserCount: null,
  //       createdAt: null,
  //       updatedAt: null,
  //     },
  //     user: {
  //       avatar: 'avatar',
  //       name: null,
  //       username: null,
  //       student: null,
  //       studentCreatedAt: null,
  //       studentUpdatedAt: null,
  //     },
  //     email: null,
  //     privateAccess: null,
  //   }

  //   beforeEach(() => {
  //     server.use(
  //       graphql.query('CurrentUser', (req, res, ctx) => {
  //         return res(ctx.status(200), ctx.data({ me: user }))
  //       })
  //     )
  //     return setup()
  //   })

  //   it('set the user data in the dataLayer', () => {
  //     expect(window.dataLayer[0]).toEqual({
  //       codecov: {
  //         app: {
  //           version: 'react-app',
  //         },
  //         user: {
  //           ownerid: 3,
  //           has_yaml: false,
  //           avatar: 'avatar',
  //           service_id: '123',
  //           plan: 'plan',
  //           staff: false,
  //           service: 'github',
  //           email: 'unknown@codecov.io',
  //           name: 'unknown',
  //           username: 'unknown',
  //           student: false,
  //           bot: false,
  //           delinquent: false,
  //           did_trial: false,
  //           private_access: false,
  //           plan_provider: '',
  //           plan_user_count: 5,
  //           created_at: '2014-01-01T12:00:00.000Z',
  //           updated_at: '2014-01-01T12:00:00.000Z',
  //           student_created_at: '2014-01-01T12:00:00.000Z',
  //           student_updated_at: '2014-01-01T12:00:00.000Z',
  //           guest: false,
  //         },
  //       },
  //     })
  //   })
  // })

  // describe('when user is not logged in', () => {
  //   beforeEach(() => {
  //     const spy = jest.spyOn(console, 'error')
  //     spy.mockImplementation(jest.fn())

  //     server.use(
  //       graphql.query('CurrentUser', (req, res, ctx) => {
  //         return res(ctx.status(200), ctx.data({ me: null }))
  //       })
  //     )
  //     return setup()
  //   })

  //   it('set the user as guest in the dataLayer', () => {
  //     expect(window.dataLayer[0]).toEqual({
  //       codecov: {
  //         app: {
  //           version: 'react-app',
  //         },
  //         user: {
  //           guest: true,
  //         },
  //       },
  //     })
  //   })
  // })
})
