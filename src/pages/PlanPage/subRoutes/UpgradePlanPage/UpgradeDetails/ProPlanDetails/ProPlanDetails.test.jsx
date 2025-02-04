import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'

vi.mock('shared/plan/BenefitList', () => ({ default: () => 'Benefits List' }))
vi.mock('shared/plan/ScheduledPlanDetails', () => ({
  default: () => 'Scheduled Plan Details',
}))

const proPlanYear = {
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
}

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

const allPlansWithoutSentry = [
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
  proPlanYear,
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
]

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Developer',
  monthlyUploadLimit: 250,
  value: Plans.USERS_DEVELOPER,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isProPlan: false,
  isSentryPlan: false,
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

describe('ProPlanDetails', () => {
  function setup(
    {
      isOngoingTrial = false,
      isSentryPlan = false,
      hasScheduledPhase = false,
      hasUserCanceledAtPeriodEnd = false,
      isProPlan = false,
    } = {
      isOngoingTrial: false,
      isSentryPlan: false,
      hasScheduledPhase: false,
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
                isFreePlan: !isProPlan && !isSentryPlan,
                isTeamPlan: false,
                trialStatus: isOngoingTrial
                  ? TrialStatuses.ONGOING
                  : TrialStatuses.CANNOT_TRIAL,
                value: isOngoingTrial
                  ? Plans.USERS_TRIAL
                  : isProPlan
                    ? Plans.USERS_PR_INAPPM
                    : Plans.USERS_DEVELOPER,
              },
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', () => {
        if (isSentryPlan) {
          return HttpResponse.json({
            data: {
              owner: {
                availablePlans: [
                  ...allPlansWithoutSentry,
                  sentryPlanMonth,
                  sentryPlanYear,
                ],
              },
            },
          })
        } else {
          return HttpResponse.json({
            data: { owner: { availablePlans: allPlansWithoutSentry } },
          })
        }
      }),
      http.get('/internal/gh/codecov/account-details', () => {
        if (isSentryPlan) {
          return HttpResponse.json({
            plan: sentryPlanYear,
            subscriptionDetail: {
              cancelAtPeriodEnd: undefined,
            },
            activatedUserCount: 10,
          })
        } else {
          return HttpResponse.json({
            plan: proPlanYear,
            subscriptionDetail: {
              cancelAtPeriodEnd: hasUserCanceledAtPeriodEnd,
            },
            scheduleDetail: {
              scheduledPhase: hasScheduledPhase
                ? {
                    quantity: 0,
                    plan: '',
                    startDate: 123456789,
                  }
                : {},
            },
            activatedUserCount: 10,
          })
        }
      })
    )
  }

  describe('when rendered', () => {
    it('shows pro yearly marketing name', async () => {
      setup({ isSentryPlan: false })
      render(<ProPlanDetails />, { wrapper: wrapper() })

      const marketingName = await screen.findByRole('heading', {
        name: /Pro plan/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('shows benefits list', async () => {
      setup({ isSentryPlan: false })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const benefitsList = await screen.findByText(/Benefits List/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows price', async () => {
      setup({ isSentryPlan: false })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const price = await screen.findByText(/\$10/)
      expect(price).toBeInTheDocument()
    })

    it('shows pricing disclaimer', async () => {
      setup({ isSentryPlan: false })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const disclaimer = await screen.findByText(
        /billed annually, or \$12 for monthly billing/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('shows schedule phase when there is one', async () => {
      setup({ isSentryPlan: false, hasScheduledPhase: true })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const scheduleDetails = await screen.findByText(/Scheduled Plan Details/i)
      expect(scheduleDetails).toBeInTheDocument()
    })

    it('does not render schedule phase when there is not one', () => {
      setup({ isSentryPlan: false, hasScheduledPhase: false })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const scheduleDetails = screen.queryByText(/Scheduled Plan Details/i)
      expect(scheduleDetails).not.toBeInTheDocument()
    })

    it('shows cancellation link when it is valid', async () => {
      setup({
        isSentryPlan: false,
        hasUserCanceledAtPeriodEnd: false,
        isOngoingTrial: false,
        isProPlan: true,
      })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })

    it('should not render cancellation link when user is ongoing trial', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: true,
      })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user has already cancelled', () => {
      setup({
        isSentryPlan: false,
        hasUserCanceledAtPeriodEnd: true,
      })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user is on developers plan', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: false,
        isProPlan: false,
      })

      render(<ProPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })
  })
})
