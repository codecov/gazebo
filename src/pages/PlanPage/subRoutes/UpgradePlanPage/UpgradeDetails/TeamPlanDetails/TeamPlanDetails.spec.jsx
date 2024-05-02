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

const allPlans = [
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
  {
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
  },
  teamPlanMonth,
  teamPlanYear,
]

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: ['team benefits'],
  billingRate: 'annually',
  marketingName: 'Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
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
      hasScheduledPhase = false,
      hasUserCanceledAtPeriodEnd = false,
      trialValue = TrialStatuses.NOT_STARTED,
    } = {
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
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                trialStatus: trialValue,
              },
            },
          })
        )
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: allPlans,
            },
          })
        )
      }),
      rest.get('/internal/gh/codecov/account-details', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            plan: teamPlanYear,
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
      })
    )
  }

  describe('when rendered', () => {
    it('shows team yearly marketing name', async () => {
      setup()
      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const marketingName = await screen.findByRole('heading', {
        name: /Team plan/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('shows benefits list', async () => {
      setup()

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const benefitsList = await screen.findByText(/Benefits List/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows price', async () => {
      setup()

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const price = await screen.findByText(/\$5/)
      expect(price).toBeInTheDocument()
    })

    it('shows pricing disclaimer', async () => {
      setup()

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const disclaimer = await screen.findByText(
        /billed annually, or \$6 for monthly billing/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('shows schedule phase when there is one', async () => {
      setup({ hasScheduledPhase: true })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const scheduleDetails = await screen.findByText(/Scheduled Plan Details/i)
      expect(scheduleDetails).toBeInTheDocument()
    })

    it('does not render schedule phase when there is not one', () => {
      setup({ hasScheduledPhase: false })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const scheduleDetails = screen.queryByText(/Scheduled Plan Details/i)
      expect(scheduleDetails).not.toBeInTheDocument()
    })

    it('shows cancellation link when it is valid', async () => {
      setup({
        hasUserCanceledAtPeriodEnd: false,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })

    it('should not render cancellation link when user is ongoing trial', () => {
      setup({
        trialValue: TrialStatuses.ONGOING,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })

    it('should not render cancellation link when user has already cancelled', () => {
      setup({
        hasUserCanceledAtPeriodEnd: true,
      })

      render(<TeamPlanDetails />, { wrapper: wrapper() })

      const link = screen.queryByRole('link', { name: /Cancel/ })
      expect(link).not.toBeInTheDocument()
    })
  })
})
