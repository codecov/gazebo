import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useSegmentUser, useSegmentPage } from './segment'
import * as Cookie from 'js-cookie'

window.analytics = {
  identify: jest.fn(),
  page: jest.fn(),
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

  describe('when user has all the data', () => {
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

    it('should set full data into identify object', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(1)
      expect(
        window.analytics.identify.mock.instances[0].identify
      ).toHaveBeenCalled()
      expect(window.analytics.identify).toBeCalledWith(1, {
        context: {
          externalIds: {
            collections: 'users',
            encoding: 'none',
            id: '123',
            type: 'github_id',
          },
        },
        integrations: {
          Marketo: false,
          Salesforce: true,
        },
        traits: {
          email: 'tedlasso@test.com',
          guest: false,
          name: 'Test User',
          ownerid: 1,
          plan: 'plan',
          service: 'github',
          service_id: '123',
          staff: true,
          username: 'test_user',
        },
        userId: 1,
      })
    })
  })

  describe('when user has all the data and all the cookies', () => {
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
      Cookie.set('_ga', '123')
      Cookie.set('_mkto_trk', '456')
      return setup()
    })

    it('hook should make 3 different identify calls', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(3)
      expect(
        window.analytics.identify.mock.instances[0].identify
      ).toBeCalledWith(1, {
        context: {
          externalIds: {
            collections: 'users',
            encoding: 'none',
            id: '123',
            type: 'github_id',
          },
        },
        integrations: {
          Marketo: false,
          Salesforce: true,
        },
        traits: {
          email: 'tedlasso@test.com',
          guest: false,
          name: 'Test User',
          ownerid: 1,
          plan: 'plan',
          service: 'github',
          service_id: '123',
          staff: true,
          username: 'test_user',
        },
        userId: 1,
      })
      expect(
        window.analytics.identify.mock.instances[1].identify
      ).toBeCalledWith({
        context: {
          externalIds: [
            {
              collection: 'users',
              encoding: 'none',
              id: '123',
              type: 'ga_client_id',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: false,
        },
      })
      expect(
        window.analytics.identify.mock.instances[2].identify
      ).toBeCalledWith({
        context: {
          externalIds: [
            {
              collection: 'users',
              encoding: 'none',
              id: '456',
              type: 'marketo_cookie',
            },
          ],
        },
        integrations: {
          Marketo: false,
          Salesforce: false,
        },
      })
    })
  })

  describe('when user is anonymous', () => {
    const spy = jest.spyOn(console, 'error')
    spy.mockImplementation(jest.fn())

    beforeEach(() => {
      server.use(
        graphql.query('CurrentUser', (req, res, ctx) => {
          return res(ctx.status(200), ctx.data({ me: null }))
        })
      )
      return setup()
    })

    it('should make an identify call as a guest', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(1)
      expect(window.analytics.identify).toBeCalledWith({})
    })
  })

  describe('when user has some missing data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 1,
        serviceId: '123',
        plan: 'plan',
        staff: true,
        service: 'github',
      },
    }

    beforeEach(() => {
      Cookie.remove('_ga')
      Cookie.remove('_mkto_trk')
      server.use(
        graphql.query('CurrentUser', (req, res, ctx) => {
          return res(ctx.status(200), ctx.data({ me: user }))
        })
      )
      return setup()
    })

    it('should make an identify call as a guest', () => {
      expect(window.analytics.identify.mock.instances).toHaveLength(1)
      expect(window.analytics.identify).toBeCalledWith(1, {
        context: {
          externalIds: {
            collections: 'users',
            encoding: 'none',
            id: '123',
            type: 'github_id',
          },
        },
        integrations: {
          Marketo: false,
          Salesforce: true,
        },
        traits: {
          email: 'unknown@codecov.io',
          guest: false,
          name: 'unknown',
          ownerid: 1,
          plan: 'plan',
          service: 'github',
          service_id: '123',
          staff: true,
          username: 'unknown',
        },
        userId: 1,
      })
    })
  })
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))

describe('useSegmentPage', () => {
  function setup(pathname) {
    useLocation.mockReturnValue({ pathname })
    renderHook(() => useSegmentPage())
  }

  describe('when there is a path change', () => {
    it('makes an analytics page call', () => {
      let pathname = '/gh/thanos'
      setup(pathname)
      expect(window.analytics.page).toHaveBeenCalledTimes(1)
    })
  })

  describe('when there are a n-path changes', () => {
    it('makes nth analytics page calls', () => {
      const owners = ['orly', 'jester', 'nott']

      owners.forEach((owner) => {
        setup('/gh/' + owner)
      })

      expect(window.analytics.page).toHaveBeenCalledTimes(3)
    })
  })
})
