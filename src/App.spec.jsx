import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import App from './App'

jest.mock('./pages/AccountSettings', () => () => 'AccountSettings')
jest.mock('./pages/AdminSettings', () => () => 'AdminSettingsPage')
jest.mock('./pages/AnalyticsPage', () => () => 'AnalyticsPage')
jest.mock('./pages/CommitDetailPage', () => () => 'CommitDetailPage')
jest.mock('./pages/FeedbackPage', () => () => 'FeedbackPage')
jest.mock('./pages/LoginPage', () => () => 'LoginPage')
jest.mock('./pages/OwnerPage', () => () => 'OwnerPage')
jest.mock('./pages/MembersPage', () => () => 'MembersPage')
jest.mock('./pages/PlanPage', () => () => 'PlanPage')
jest.mock('./pages/PullRequestPage', () => () => 'PullRequestPage')
jest.mock('./pages/RepoPage', () => () => 'RepoPage')
jest.mock('./pages/TermsOfService', () => () => 'TermsOfService')
jest.mock('./pages/EnterpriseLandingPage', () => () => 'EnterpriseLandingPage')

jest.mock('./shared/GlobalBanners', () => () => '')
jest.mock('./shared/GlobalTopBanners', () => () => '')
jest.mock('./layouts/Header', () => () => '')
jest.mock('./layouts/Footer', () => () => '')

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => 'ReactQueryDevtools',
}))

jest.mock('config')
jest.mock('shared/featureFlags')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
  termsAgreement: true,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()
let testLocation
const wrapper =
  (initialEntries = []) =>
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
})
afterEach(() => {
  config.IS_SELF_HOSTED = false
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('App', () => {
  function setup(
    { termsOfServicePage = false } = { termsOfServicePage: false }
  ) {
    const mockMutationVariables = jest.fn()
    useFlags.mockReturnValue({
      termsOfServicePage,
    })

    server.use(
      graphql.query('DetailOwner', (_, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: 'codecov' }))
      ),
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            me: {
              user: user,
              trackingMetadata: { ownerid: 123 },
              ...user,
            },
          })
        )
      ),
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        mockMutationVariables(req.variables)

        return res(
          ctx.status(200),
          ctx.data({
            updateDefaultOrganization: {
              defaultOrg: {
                username: 'criticalRole',
              },
            },
          })
        )
      })
    )

    return {
      mockMutationVariables,
    }
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
          location: '/gh/CodecovUser',
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
        testLabel: 'FeedbackPage',
        pathname: '/bb/feedback',
        expected: {
          page: /FeedbackPage/i,
          location: '/bb/feedback',
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
          location: '/login/gh',
        },
      },
    ],
    [
      {
        testLabel: 'provider page',
        pathname: '/gh',
        expected: {
          page: /OwnerPage/i,
          location: '/gh/CodecovUser',
        },
      },
    ],
    [
      {
        testLabel: 'provider page with request params',
        pathname: '/gh?setup_action=request',
        expected: {
          page: /OwnerPage/i,
          location: '/gh/CodecovUser',
        },
      },
    ],
  ]

  describe.each(cloudFullRouterCases)(
    'cloud routing',
    ({ testLabel, pathname, expected }) => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = false
        setup()
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
        testLabel: 'FeedbackPage',
        pathname: '/bb/feedback',
        expected: {
          page: /FeedbackPage/i,
          location: '/bb/feedback',
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
  ]

  describe.each(selfHostedFullRouterCases)(
    'self hosted routing',
    ({ testLabel, pathname, expected }) => {
      beforeEach(() => {
        config.IS_SELF_HOSTED = true
        setup()
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

  describe('feature flag is on and set up action param is request', () => {
    it('renders children', async () => {
      setup()

      render(<App />, {
        wrapper: wrapper(['/gh/CodecovUser?setup_action=request']),
      })

      await waitFor(() => expect(testLocation.pathname).toBe('/gh/CodecovUser'))

      await waitFor(() =>
        expect(testLocation.search).toEqual('?setup_action=request')
      )
    })
  })

  it('fires update default org mutation', async () => {
    const { mockMutationVariables } = setup()

    render(<App />, {
      wrapper: wrapper(['/gh?setup_action=request']),
    })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    await waitFor(() =>
      expect(mockMutationVariables).toHaveBeenCalledWith({
        input: {
          username: 'CodecovUser',
        },
      })
    )
  })
})
