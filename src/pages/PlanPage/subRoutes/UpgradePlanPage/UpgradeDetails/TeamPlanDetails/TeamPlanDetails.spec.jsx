import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import TeamPlanDetails from './TeamPlanDetails'

jest.mock('shared/plan/BenefitList', () => () => 'Benefits List')
jest.mock(
  'shared/plan/ScheduledPlanDetails',
  () => () => 'Scheduled Plan Details'
)

const proPlanYear = {
  marketingName: 'Pro',
  value: 'users-pr-inappy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
  monthlyUploadLimit: null,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  trialDays: 14,
  monthlyUploadLimit: null,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
}

const allPlansWithoutSentry = [
  {
    marketingName: 'Basic',
    value: 'users-free',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
  },
  {
    marketingName: 'Pro',
    value: 'users-pr-inappm',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  proPlanYear,
  {
    marketingName: 'Pro',
    value: 'users-enterprisem',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro',
    value: 'users-enterprisey',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
]

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (initialEntries = '/plan/gh/codecov/upgrade') =>
  ({ children }) =>
    (
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

describe('TeamPlanDetails', () => {
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
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                ...mockPlanData,
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
          })
        )
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        if (isSentryPlan) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                availablePlans: [
                  ...allPlansWithoutSentry,
                  sentryPlanMonth,
                  sentryPlanYear,
                  teamPlanMonth,
                  teamPlanYear,
                ],
              },
            })
          )
        } else {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                availablePlans: [
                  ...allPlansWithoutSentry,
                  teamPlanMonth,
                  teamPlanYear,
                ],
              },
            })
          )
        }
      }),
      rest.get('/internal/gh/codecov/account-details', (req, res, ctx) => {
        if (isSentryPlan) {
          return res(
            ctx.status(200),
            ctx.json({
              plan: sentryPlanYear,
              subscriptionDetail: {
                cancelAtPeriodEnd: undefined,
              },
              activatedUserCount: 10,
            })
          )
        } else {
          return res(
            ctx.status(200),
            ctx.json({
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
          )
        }
      })
    )
  }

  describe('when rendered', () => {
    it('shows pro yearly marketing name', async () => {
      setup({ isSentryPlan: false })
      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const marketingName = await screen.findByRole('heading', {
        name: /Team plan/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('shows benefits list', async () => {
      setup({ isSentryPlan: false })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const benefitsList = await screen.findByText(/Benefits List/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows price', async () => {
      setup({ isSentryPlan: false })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const price = await screen.findByText(/\$5/)
      expect(price).toBeInTheDocument()
    })

    it('shows pricing disclaimer', async () => {
      setup({ isSentryPlan: false })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const disclaimer = await screen.findByText(/per user, per month/i)
      expect(disclaimer).toBeInTheDocument()
    })

    it('shows schedule phase when there is one', async () => {
      setup({ isSentryPlan: false, hasScheduledPhase: true })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const scheduleDetails = await screen.findByText(/Scheduled Plan Details/i)
      expect(scheduleDetails).toBeInTheDocument()
    })

    it('does not render schedule phase when there is not one', () => {
      setup({ isSentryPlan: false, hasScheduledPhase: false })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

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

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })

    it('should not render cancellation link when user is ongoing trial', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: true,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user has already cancelled', () => {
      setup({
        isSentryPlan: false,
        hasUserCanceledAtPeriodEnd: true,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user is on basic plan', () => {
      setup({
        isSentryPlan: false,
        isOngoingTrial: false,
        isProPlan: false,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })
  })
})
