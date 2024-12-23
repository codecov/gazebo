import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import SentryPlanDetails from './SentryPlanDetails'

vi.mock('shared/plan/BenefitList', () => ({ default: () => 'Benefits List' }))

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
  value: Plans.USERS_SENTRYM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: true,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
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

const allPlans = [
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
    marketingName: 'Pro',
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
    marketingName: 'Pro',
    value: Plans.USERS_PR_INAPPY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    quantity: 10,
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro',
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
    marketingName: 'Pro',
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
  sentryPlanMonth,
  sentryPlanYear,
]

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
  isEnterprisePlan: false,
  isProPlan: false,
  isTrialPlan: false,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (initialEntries = '/plan/gh/codecov/upgrade') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/plan/:provider/:owner/upgrade">
          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('SentryPlanDetails', () => {
  function setup(
    {
      isOngoingTrial = false,
      hasUserCanceledAtPeriodEnd = false,
      isProPlan = false,
    } = {
      isOngoingTrial: false,
      hasUserCanceledAtPeriodEnd: false,
      isProPlan: false,
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
                isFreePlan: !isProPlan,
                isTeamPlan: false,
                trialStatus: isOngoingTrial
                  ? TrialStatuses.ONGOING
                  : TrialStatuses.CANNOT_TRIAL,
                value: isOngoingTrial
                  ? Plans.USERS_TRIAL
                  : isProPlan
                    ? Plans.USERS_PR_INAPPM
                    : Plans.USERS_BASIC,
              },
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: { owner: { availablePlans: allPlans } },
        })
      }),
      http.get('/internal/gh/codecov/account-details', () => {
        return HttpResponse.json({
          plan: sentryPlanYear,
          subscriptionDetail: {
            cancelAtPeriodEnd: hasUserCanceledAtPeriodEnd,
          },
          activatedUserCount: 10,
        })
      })
    )
  }

  describe('when rendered', () => {
    it('renders sentry pro yearly marketing name', async () => {
      setup()
      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const marketingName = await screen.findByRole('heading', {
        name: /Sentry Pro plan/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('renders 29 monthly bundle', async () => {
      setup()

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const price = await screen.findByText(/\$29/)
      expect(price).toBeInTheDocument()
    })

    it('renders benefits list', async () => {
      setup()

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const benefitsList = await screen.findByText(/Benefits List/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('renders pricing disclaimer', async () => {
      setup()

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const disclaimer = await screen.findByText(
        /over 5 users is \$10 per user\/month, billed annually/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('renders cancellation link when it is valid', async () => {
      setup({
        isSentryPlan: false,
        hasUserCanceledAtPeriodEnd: false,
        isOngoingTrial: false,
        isProPlan: true,
      })

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })

    it('should not render cancellation link when user is ongoing trial', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: true,
      })

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user has already cancelled', () => {
      setup({
        isSentryPlan: false,
        hasUserCanceledAtPeriodEnd: true,
      })

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user is on basic plan', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: false,
        isProPlan: false,
      })

      render(<SentryPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })
  })
})
