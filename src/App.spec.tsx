import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import config from 'config'

import { useLocationParams } from 'services/navigation'

import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('./pages/AdminSettings', () => () => 'AdminSettingsPage')
jest.mock('./pages/AnalyticsPage', () => () => 'AnalyticsPage')
jest.mock('./pages/CommitDetailPage', () => () => 'CommitDetailPage')
jest.mock('./pages/LoginPage', () => () => 'LoginPage')
jest.mock('./pages/OwnerPage', () => () => 'OwnerPage')
jest.mock('./pages/MembersPage', () => () => 'MembersPage')
jest.mock('./pages/PlanPage', () => () => 'PlanPage')
jest.mock('./pages/PullRequestPage', () => () => 'PullRequestPage')
jest.mock('./pages/RepoPage', () => () => 'RepoPage')
jest.mock('./pages/TermsOfService', () => () => 'TermsOfService')
jest.mock('./pages/EnterpriseLandingPage', () => () => 'EnterpriseLandingPage')
jest.mock('./pages/SyncProviderPage', () => () => 'SyncProviderPage')

jest.mock('services/navigation', () => ({
  ...jest.requireActual('services/navigation'),
  useLocationParams: jest.fn(),
}))

const mockedUseLocationParams = useLocationParams as jest.Mock

const internalUser = {
  email: 'internal@user.com',
  name: 'Internal User',
  externalId: '123',
  owners: [
    {
      avatarUrl: 'super-cool-url',
      integrationId: null,
      name: null,
      ownerid: 123,
      service: 'cool-service',
      stats: null,
      username: 'cool-guy',
    },
  ],
  termsAgreement: true,
}

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const server = setupServer()
let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (initialEntries = ['']): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})

beforeEach(() => {
  config.IS_SELF_HOSTED = false
  queryClient.clear()
  server.resetHandlers()
  mockedUseLocationParams.mockReturnValue({ params: {} })
})

afterAll(() => {
  server.close()
})

describe('App', () => {
  function setup({
    hasLoggedInUser,
    hasSession,
  }: {
    hasLoggedInUser?: boolean
    hasSession?: boolean
  }) {
    server.use(
      rest.get('/internal/user', (_, res, ctx) => {
        if (hasSession) {
          return res(ctx.status(200), ctx.json(internalUser))
        } else {
          return res(ctx.status(200), ctx.json({}))
        }
      }),
      rest.get('/internal/users/current', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}))
      }),
      graphql.query('DetailOwner', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: 'codecov' }))
      ),
      graphql.query('CurrentUser', (req, res, ctx) => {
        if (hasLoggedInUser) {
          return res(ctx.status(200), ctx.data(user))
        }
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('Seats', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('HasAdmins', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({}))
      })
    )
  }

  const cloudFullRouterCases = [
    [
      {
        testLabel: 'LoginPage',
        pathname: '/login',
        expected: {
          page: /LoginPage/i,
          location: '/login',
        },
      },
    ],
    [
      {
        testLabel: 'LoginPage',
        pathname: '/login/bb',
        expected: {
          page: /LoginPage/i,
          location: '/login/bb',
        },
      },
    ],
    [
      {
        testLabel: 'AccountSettings',
        pathname: '/account/gh/codecov',
        expected: {
          page: /AccountSettings/i,
          location: '/account/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'AdminSettingsPage',
        pathname: '/admin/gh/access',
        expected: {
          page: /RepoPage/i,
          location: '/admin/gh/access', // Should probably redirect this but I'm trying to keep existing behavior.
        },
      },
    ],
    [
      {
        testLabel: 'PlanPage',
        pathname: '/plan/gh/codecov',
        expected: {
          page: /PlanPage/i,
          location: '/plan/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'OldPlanPage',
        pathname: '/plan/gh',
        expected: {
          page: /OwnerPage/i,
          location: '/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'MembersPage',
        pathname: '/members/gh/codecov',
        expected: {
          page: /MembersPage/i,
          location: '/members/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'AnalyticsPage',
        pathname: '/analytics/gh/codecov',
        expected: {
          page: /AnalyticsPage/i,
          location: '/analytics/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'OwnerPage',
        pathname: '/gh/codecov',
        expected: {
          page: /OwnerPage/i,
          location: '/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'compare to pull redirect',
        pathname: '/gh/codecov/codecov/compare/123...456',
        expected: {
          page: /PullRequestPage/i,
          location: '/gh/codecov/codecov/pull/123...456',
        },
      },
    ],
    [
      {
        testLabel: 'PullRequestPage',
        pathname: '/gh/codecov/codecov/pull/123',
        expected: {
          page: /PullRequestPage/i,
          location: '/gh/codecov/codecov/pull/123',
        },
      },
    ],
    [
      {
        testLabel: 'CommitDetailPage',
        pathname: '/gh/codecov/codecov/commit/123',
        expected: {
          page: /CommitDetailPage/i,
          location: '/gh/codecov/codecov/commit/123',
        },
      },
    ],
    [
      {
        testLabel: 'CommitDetailPage',
        pathname: '/gh/codecov/codecov/commit/123/tree/main.ts',
        expected: {
          page: /CommitDetailPage/i,
          location: '/gh/codecov/codecov/commit/123/tree/main.ts',
        },
      },
    ],
    [
      {
        testLabel: 'RepoPage',
        pathname: '/gh/codecov/codecov',
        expected: {
          page: /RepoPage/i,
          location: '/gh/codecov/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'LoginPage',
        pathname: '/',
        expected: {
          page: /LoginPage/i,
          location: '/login',
        },
      },
    ],
    [
      {
        testLabel: 'SyncProviderPage',
        pathname: '/sync',
        expected: {
          page: /SyncProviderPage/i,
          location: '/sync',
        },
      },
    ],
  ]

  describe.each(cloudFullRouterCases)(
    'cloud routing',
    ({ testLabel, pathname, expected }) => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = false
        setup({ hasLoggedInUser: true, hasSession: true })
      })

      it(`renders the ${testLabel} page`, async () => {
        render(<App />, { wrapper: wrapper([pathname]) })

        await waitFor(() =>
          expect(testLocation.pathname).toBe(expected.location)
        )

        const page = await screen.findByText(expected.page)
        expect(page).toBeInTheDocument()
      })
    }
  )

  const selfHostedFullRouterCases = [
    [
      {
        testLabel: 'LoginPage',
        pathname: '/login',
        expected: {
          page: /EnterpriseLandingPage/i,
          location: '/',
        },
      },
    ],
    [
      {
        testLabel: 'LoginPage',
        pathname: '/login/bb',
        expected: {
          page: /EnterpriseLandingPage/i,
          location: '/',
        },
      },
    ],
    [
      {
        testLabel: 'AccountSettings',
        pathname: '/account/gh/codecov',
        expected: {
          page: /AccountSettings/i,
          location: '/account/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'AdminSettingsPage',
        pathname: '/admin/gh/access',
        expected: {
          page: /AdminSettings/i,
          location: '/admin/gh/access',
        },
      },
    ],
    [
      {
        testLabel: 'OwnerPage',
        pathname: '/plan/gh/codecov',
        expected: {
          page: /RepoPage/i,
          location: '/plan/gh/codecov', // Should probably redirect this but I'm trying to keep existing behavior.
        },
      },
    ],
    [
      {
        testLabel: 'AllOrgsPlanPage',
        pathname: '/plan/gh',
        expected: {
          page: /OwnerPage/i,
          location: '/plan/gh', // We should probably redirect this but I'm trying to keep existing behavior.
        },
      },
    ],
    [
      {
        testLabel: 'MembersPage',
        pathname: '/members/gh/codecov',
        expected: {
          page: /RepoPage/i,
          location: '/members/gh/codecov', // Should probably redirect this but I'm trying to keep existing behavior.
        },
      },
    ],
    [
      {
        testLabel: 'AnalyticsPage',
        pathname: '/analytics/gh/codecov',
        expected: {
          page: /AnalyticsPage/i,
          location: '/analytics/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'OwnerPage',
        pathname: '/gh/codecov',
        expected: {
          page: /OwnerPage/i,
          location: '/gh/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'compare to pull redirect',
        pathname: '/gh/codecov/codecov/compare/123...456',
        expected: {
          page: /PullRequestPage/i,
          location: '/gh/codecov/codecov/pull/123...456',
        },
      },
    ],
    [
      {
        testLabel: 'PullRequestPage',
        pathname: '/gh/codecov/codecov/pull/123',
        expected: {
          page: /PullRequestPage/i,
          location: '/gh/codecov/codecov/pull/123',
        },
      },
    ],
    [
      {
        testLabel: 'CommitDetailPage',
        pathname: '/gh/codecov/codecov/commit/123',
        expected: {
          page: /CommitDetailPage/i,
          location: '/gh/codecov/codecov/commit/123',
        },
      },
    ],
    [
      {
        testLabel: 'CommitDetailPage',
        pathname: '/gh/codecov/codecov/commit/123/tree/main.ts',
        expected: {
          page: /CommitDetailPage/i,
          location: '/gh/codecov/codecov/commit/123/tree/main.ts',
        },
      },
    ],
    [
      {
        testLabel: 'RepoPage',
        pathname: '/gh/codecov/codecov',
        expected: {
          page: /RepoPage/i,
          location: '/gh/codecov/codecov',
        },
      },
    ],
    [
      {
        testLabel: 'EnterpriseLandingPage',
        pathname: '/',
        expected: {
          page: /EnterpriseLandingPage/i,
          location: '/',
        },
      },
    ],
    [
      {
        testLabel: 'SyncProviderPage',
        pathname: '/sync',
        expected: {
          page: /SyncProviderPage/i,
          location: '/sync',
        },
      },
    ],
  ]

  describe.each(selfHostedFullRouterCases)(
    'self hosted routing',
    ({ testLabel, pathname, expected }) => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
        setup({ hasLoggedInUser: true, hasSession: true })
      })

      it(`renders the ${testLabel} page`, async () => {
        render(<App />, { wrapper: wrapper([pathname]) })

        await waitFor(() =>
          expect(testLocation.pathname).toBe(expected.location)
        )
        const page = await screen.findByText(expected.page)
        expect(page).toBeInTheDocument()
      })
    }
  )

  describe('user not logged in', () => {
    it('redirects to login', async () => {
      setup({ hasLoggedInUser: true, hasSession: false })
      render(<App />, { wrapper: wrapper(['*']) })
      await waitFor(() => expect(testLocation.pathname).toBe('/login'))
    })
  })

  describe('user has setup action', () => {
    it(`renders the setup action redirect page`, async () => {
      mockedUseLocationParams.mockReturnValue({
        params: { setup_action: 'install' },
      })
      setup({ hasLoggedInUser: true, hasSession: true })
      render(<App />, { wrapper: wrapper(['/gh?setup_action=install']) })

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/codecov'))
      const page = await screen.findByText(/OwnerPage/i)
      expect(page).toBeInTheDocument()
    })
  })
  describe('user has session, not logged in', () => {
    it('redirects to session default', async () => {
      setup({ hasLoggedInUser: false, hasSession: true })

      render(<App />, { wrapper: wrapper(['/blah']) })
      await waitFor(() =>
        expect(testLocation.pathname).toBe('/cool-service/cool-guy')
      )
    })

    it('redirects to plan page if to param === plan', async () => {
      mockedUseLocationParams.mockReturnValue({
        params: { to: 'plan' },
      })
      setup({ hasLoggedInUser: false, hasSession: true })

      render(<App />, { wrapper: wrapper(['/blah']) })
      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/cool-service/cool-guy')
      )
    })
  })
})
