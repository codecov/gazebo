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

  describe('when the user is logged-in', () => {
    const user = {
      ownerid: 1,
      email: 'fake@test.com',
      username: 'fake',
      service: 'github',
      serviceId: '1',
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
            ...user,
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
