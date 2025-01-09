import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import UpgradePlanPage from './UpgradePlanPage'

vi.mock('./UpgradeForm', () => ({ default: () => 'UpgradeForm' }))

const plans = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_FREE,
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_PR_INAPPM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_PR_INAPPY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
]

const sentryPlanMonth = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
  isTeamPlan: false,
  isSentryPlan: true,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
  isTeamPlan: false,
  isSentryPlan: true,
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
  isTeamPlan: true,
  isSentryPlan: false,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  isTeamPlan: true,
  isSentryPlan: false,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: Plans.USERS_BASIC,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialWrappers = '/plan/gh/codecov/upgrade') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialWrappers]}>
        <Route path="/plan/:provider/:owner/upgrade">
          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </Route>
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('UpgradePlanPage', () => {
  function setup(
    {
      planValue = Plans.USERS_PR_INAPPY,
      periodEnd = undefined,
      includeSentryPlans = false,
      includeTeamPlans = false,
    } = {
      planValue: Plans.UUSERS_PR_INAPPY,
      periodEnd: undefined,
      includeSentryPlans: false,
      includeTeamPlans: false,
    }
  ) {
    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                isEnterprisePlan: planValue === Plans.USERS_ENTERPRISEM,
                isTeamPlan:
                  planValue === Plans.USERS_TEAMM ||
                  planValue === Plans.USERS_TEAMY,
                isFreePlan: planValue === Plans.USERS_BASIC,
                isProPlan: planValue === Plans.USERS_PR_INAPPY,
                isTrialPlan: planValue === Plans.USERS_TRIAL,
                isSentryPlan:
                  planValue === Plans.USERS_SENTRYY ||
                  planValue === Plans.USERS_SENTRYM,
                value: planValue,
              },
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', () => {
        if (includeSentryPlans) {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: [sentryPlanMonth, sentryPlanYear] },
            },
          })
        } else if (includeTeamPlans) {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: [teamPlanMonth, teamPlanYear] },
            },
          })
        } else {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: plans },
            },
          })
        }
      }),
      http.get('/internal/gh/codecov/account-details', () => {
        if (planValue === Plans.USERS_SENTRYY) {
          return HttpResponse.json({
            plan: sentryPlanYear,
            subscriptionDetail: {
              cancelAtPeriodEnd: periodEnd,
            },
            activatedUserCount: 10,
          })
        }

        return HttpResponse.json({
          plan: {
            marketingName: 'Pro Team',
            value: planValue,
            baseUnitPrice: 12,
            benefits: [
              'Configurable # of users',
              'Unlimited public repositories',
              'Unlimited private repositories',
              'Priority Support',
            ],
          },
          subscriptionDetail: {
            cancelAtPeriodEnd: periodEnd,
          },
          activatedUserCount: 10,
        })
      })
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the basic plan title', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()
    })

    it('renders a cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const cancelLink = await screen.findByText('Cancel')
      expect(cancelLink).toBeInTheDocument()
    })

    it('does not render upgrade banner', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('when rendered with a free plan', () => {
    it('renders the basic plan title', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()
    })

    it('does not render a cancel plan link', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const cancelLink = screen.queryByText('Cancel')
      expect(cancelLink).not.toBeInTheDocument()
    })

    it('does not render upgrade banner', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })

    describe('when rendered with a team plan search param', () => {
      it('renders the team plan title', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const teamTitle = await screen.findByText(/Team plan/)
        expect(teamTitle).toBeInTheDocument()
      })

      it('renders the team plan price', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const teamPlanPrice = await screen.findByText(/\$5/)
        expect(teamPlanPrice).toBeInTheDocument()

        const teamPlanPricingScheme = await screen.findByText(/per user\/month/)
        expect(teamPlanPricingScheme).toBeInTheDocument()
      })

      it('renders the team plan benefits', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const userCount = await screen.findByText(/Up to 10 users/)
        expect(userCount).toBeInTheDocument()
      })
    })
  })

  describe('when rendered with an enterprise plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_ENTERPRISEM })
    })

    it('redirects user to plan page', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })

  describe('when account has already cancelled plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_INAPPY, periodEnd: true })
    })

    it('does not render cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const cancelLink = screen.queryByText('Cancel plan')
      expect(cancelLink).not.toBeInTheDocument()
    })
  })

  describe('when rendered when a sentry plan', () => {
    beforeEach(() =>
      setup({ planValue: Plans.USERS_SENTRYY, includeSentryPlans: true })
    )

    it('renders the sentry plan title', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Sentry Pro Team/)
      expect(title).toBeInTheDocument()
    })
  })
})
