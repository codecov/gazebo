import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React, { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'
import { type Mock, vi } from 'vitest'

import config from 'config'

import { useLocationParams } from 'services/navigation'
import { Plans } from 'shared/utils/billing'

import App from './App'

vi.mock('./pages/AccountSettings', () => ({ default: () => 'AccountSettings' }))
vi.mock('./pages/AdminSettings', () => ({ default: () => 'AdminSettingsPage' }))
vi.mock('./pages/AnalyticsPage', () => ({ default: () => 'AnalyticsPage' }))
vi.mock('./pages/CommitDetailPage', () => ({
  default: () => 'CommitDetailPage',
}))
vi.mock('./pages/LoginPage', () => ({ default: () => 'LoginPage' }))
vi.mock('./pages/OwnerPage', () => ({ default: () => 'OwnerPage' }))
vi.mock('./pages/MembersPage', () => ({ default: () => 'MembersPage' }))
vi.mock('./pages/PlanPage', () => ({ default: () => 'PlanPage' }))
vi.mock('./pages/PullRequestPage', () => ({ default: () => 'PullRequestPage' }))
vi.mock('./pages/RepoPage', () => ({ default: () => 'RepoPage' }))
vi.mock('./pages/TermsOfService', () => ({ default: () => 'TermsOfService' }))
vi.mock('./pages/EnterpriseLandingPage', () => ({
  default: () => 'EnterpriseLandingPage',
}))
vi.mock('./pages/SyncProviderPage', () => ({
  default: () => 'SyncProviderPage',
}))

vi.mock('services/navigation', async () => {
  const servicesNavigation = await vi.importActual('services/navigation')

  return {
    ...servicesNavigation,
    useLocationParams: vi.fn(),
  }
})

const mockedUseLocationParams = useLocationParams as Mock

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
      plan: Plans.USERS_BASIC,
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

const mockRepoOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      testAnalyticsEnabled: true,
      languages: ['JavaScript'],
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

let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (initialEntries = ['']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Suspense fallback={<p>Loading</p>}>
          {children}
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </Suspense>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})

beforeEach(() => {
  config.IS_SELF_HOSTED = false
  mockedUseLocationParams.mockReturnValue({ params: {} })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
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
      http.get('/internal/user', (info) => {
        if (hasSession) {
          return HttpResponse.json(internalUser)
        } else {
          return HttpResponse.json({})
        }
      }),
      http.get('/internal/users/current', (info) => {
        return HttpResponse.json({})
      }),
      graphql.query('DetailOwner', (info) =>
        HttpResponse.json({ data: { owner: 'codecov' } })
      ),
      graphql.query('CurrentUser', (info) => {
        if (hasLoggedInUser) {
          return HttpResponse.json({ data: user })
        }
        HttpResponse.json({ data: {} })
      }),
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('OwnerTier', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('Seats', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('HasAdmins', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('owner', (info) => {
        return HttpResponse.json({ data: { owner: { isAdmin: true } } })
      }),
      graphql.query('MyContexts', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('GetOktaConfig', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('OwnerPageData', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.mutation('updateDefaultOrganization', (info) => {
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      }),
      graphql.query('GetUploadTokenRequired', (info) => {
        return HttpResponse.json({ data: {} })
      })
    )
  }

  const cloudFullRouterCases = [
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
        testLabel: 'SyncProviderPage',
        pathname: '/sync',
        expected: {
          page: /SyncProviderPage/i,
          location: '/sync',
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
  ]

  describe.each(cloudFullRouterCases)(
    'cloud routing',
    ({ testLabel, pathname, expected }) => {
      beforeEach(() => {
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
