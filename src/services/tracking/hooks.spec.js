import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useTracking } from './useTracking'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('useTracking', () => {
  let pendoCopy = window.pendo

  afterAll(() => {
    // Cleanup window "mocks"
    window.pendo = pendoCopy
  })

  function setup(user) {
    window.pendo = {
      initialize: jest.fn(),
      updateOptions: jest.fn(),
    }

    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(user))
      }),
      graphql.query('DetailOwner', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: 'codecov' }))
      })
    )
  }

  describe('when the user is logged-in and has all data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 1,
        hasYaml: true,
        serviceId: '123',
        plan: 'plan',
        staff: true,
        bot: true,
        delinquent: true,
        didTrial: true,
        planProvider: 'provider',
        planUserCount: 1000,
        service: 'github',
        createdAt: new Date('2017-01-01 12:00:00').toISOString(),
        updatedAt: new Date('2018-01-01 12:00:00').toISOString(),
      },
      user: {
        avatar: 'avatar',
        name: 'Eugene Onegin',
        username: 'eugene_onegin',
        student: true,
        studentCreatedAt: new Date('2019-01-01 12:00:00').toISOString(),
        studentUpdatedAt: new Date('2020-01-01 12:00:00').toISOString(),
      },
      privateAccess: true,
      email: 'fake@test.com',
    }

    beforeEach(() => {
      setup({ me: user })
    })

    it('fires pendo', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() =>
        expect(window.pendo.initialize).toHaveBeenCalledTimes(1)
      )
    })

    it('sets user in sentry', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalled())
      await waitFor(() =>
        expect(Sentry.setUser).toHaveBeenCalledWith({
          email: 'fake@test.com',
          username: 'eugene_onegin',
          ip_address: '{{auto}}',
        })
      )
    })
  })

  describe('when the user is logged-in but missing data', () => {
    const user = {
      trackingMetadata: {
        ownerid: 3,
        hasYaml: false,
        serviceId: '123',
        service: 'github',
        plan: 'plan',
        staff: false,
        bot: null,
        delinquent: null,
        didTrial: null,
        planProvider: null,
        planUserCount: null,
        createdAt: null,
        updatedAt: null,
      },
      user: {
        avatar: 'avatar',
        name: null,
        username: null,
        student: null,
        studentCreatedAt: null,
        studentUpdatedAt: null,
      },
      email: null,
      privateAccess: null,
    }

    beforeEach(() => {
      setup({ me: user })
    })

    it('sets user in sentry', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalled())
      await waitFor(() =>
        expect(Sentry.setUser).toHaveBeenCalledWith({ ip_address: '{{auto}}' })
      )
    })
  })

  describe('when user is not logged in', () => {
    beforeEach(() => {
      const spy = jest.spyOn(console, 'error')
      spy.mockImplementation(jest.fn())

      setup({ me: null })
    })

    it('sets null user in sentry', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalled())
      await waitFor(() =>
        expect(Sentry.setUser).toHaveBeenCalledWith({ ip_address: '{{auto}}' })
      )
    })
  })
})
