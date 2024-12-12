import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type MockInstance } from 'vitest'

import { User, useUser } from './useUser'

const user = {
  me: {
    owner: {
      defaultOrgUsername: 'codecov',
    },
    email: 'jane.doe@codecov.io',
    privateAccess: true,
    onboardingCompleted: true,
    businessEmail: 'jane.doe@codecov.io',
    termsAgreement: true,
    user: {
      name: 'Jane Doe',
      username: 'janedoe',
      avatarUrl: 'http://127.0.0.1/avatar-url',
      avatar: 'http://127.0.0.1/avatar-url',
      student: false,
      studentCreatedAt: null,
      studentUpdatedAt: null,
      customerIntent: 'PERSONAL',
    },
    trackingMetadata: {
      service: 'github',
      ownerid: 123,
      serviceId: '123',
      plan: 'users-basic',
      staff: false,
      hasYaml: false,
      bot: null,
      delinquent: null,
      didTrial: null,
      planProvider: null,
      planUserCount: 1,
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      profile: {
        createdAt: 'timestamp',
        otherGoal: null,
        typeProjects: [],
        goals: [],
      },
    },
  },
}

const nullUser = {
  me: null,
}

const badResponse = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('useUser', () => {
  function setup(userData: User | object) {
    server.use(
      graphql.query('CurrentUser', () => {
        return HttpResponse.json({ data: userData })
      })
    )
  }

  describe('when query resolves', () => {
    describe('there is user data', () => {
      it('returns the user', async () => {
        setup(user)
        const { result } = renderHook(() => useUser(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.data).toEqual(user.me))
      })
    })

    describe('there is no user data', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('returns the user', async () => {
        setup(nullUser)
        const { result } = renderHook(() => useUser(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.data).toEqual(null))
      })
    })

    describe('the response is bad', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('returns 404 failed to parse', async () => {
        setup(badResponse)
        const { result } = renderHook(() => useUser(), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.status).toEqual('error'))
        await waitFor(() =>
          expect(result.current.failureReason).toEqual(
            expect.objectContaining({
              data: {},
              dev: 'useUser - 404 failed to parse',
              status: 404,
            })
          )
        )
      })
    })
  })
})
