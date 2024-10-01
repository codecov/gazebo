import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
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
      initialize: vi.fn(),
      updateOptions: vi.fn(),
    }

    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: user })
      }),
      graphql.query('DetailOwner', (info) => {
        return HttpResponse.json({ data: { owner: 'codecov' } })
      })
    )
  }

  describe('when the user is logged-in and has all data', () => {
    const user = {
      owner: {
        defaultOrgUsername: 'codecov',
      },
      email: 'fake@test.com',
      privateAccess: true,
      onboardingCompleted: true,
      businessEmail: 'fake@test.com',
      termsAgreement: true,
      user: {
        name: 'Eugene Onegin',
        username: 'eugene_onegin',
        avatarUrl: 'avatar',
        avatar: 'avatar',
        student: true,
        studentCreatedAt: new Date('2019-01-01 12:00:00').toISOString(),
        studentUpdatedAt: new Date('2020-01-01 12:00:00').toISOString(),
        customerIntent: 'PERSONAL',
      },
      trackingMetadata: {
        service: 'github',
        ownerid: 1,
        serviceId: '123',
        plan: 'plan',
        staff: true,
        hasYaml: true,
        bot: null,
        delinquent: true,
        didTrial: true,
        planProvider: 'provider',
        planUserCount: 1000,
        createdAt: new Date('2017-01-01 12:00:00').toISOString(),
        updatedAt: new Date('2018-01-01 12:00:00').toISOString(),
        profile: {
          createdAt: new Date('2017-01-01 12:00:00').toISOString(),
          otherGoal: null,
          typeProjects: [],
          goals: [],
        },
      },
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
        })
      )
    })
  })

  describe('when the user is logged-in but missing data', () => {
    const user = {
      owner: {
        defaultOrgUsername: 'codecov',
      },
      email: null,
      privateAccess: null,
      onboardingCompleted: true,
      businessEmail: null,
      termsAgreement: null,
      user: {
        name: null,
        username: 'eugene_onegin',
        avatarUrl: 'avatar',
        avatar: 'avatar',
        student: true,
        studentCreatedAt: null,
        studentUpdatedAt: null,
        customerIntent: 'PERSONAL',
      },
      trackingMetadata: {
        service: 'github',
        ownerid: 1,
        serviceId: '123',
        plan: 'plan',
        staff: false,
        hasYaml: false,
        bot: null,
        delinquent: null,
        didTrial: null,
        planProvider: null,
        planUserCount: null,
        createdAt: null,
        updatedAt: null,
        profile: {
          createdAt: new Date('2017-01-01 12:00:00').toISOString(),
          otherGoal: null,
          typeProjects: [],
          goals: [],
        },
      },
    }

    beforeEach(() => {
      setup({ me: user })
    })

    it('sets null user in sentry', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalled())
      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalledWith(null))
    })
  })

  describe('when user is not logged in', () => {
    let consoleSpy
    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      setup({ me: null })
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('sets null user in sentry', async () => {
      renderHook(() => useTracking(), { wrapper })

      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalled())
      await waitFor(() => expect(Sentry.setUser).toHaveBeenCalledWith(null))
    })
  })
})
