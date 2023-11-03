import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { useFlags } from 'shared/featureFlags'

import FreePlanCard from './FreePlanCard'

jest.mock('./PlanUpgradeTeam', () => () => 'PlanUpgradeTeam')
jest.mock('shared/featureFlags')

const allPlans = [
  {
    marketingName: 'Basic',
    value: 'users-basic',
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
    marketingName: 'Pro Team',
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
    marketingName: 'Pro Team',
    value: 'users-pr-inappy',
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
  {
    marketingName: 'Pro Team',
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
    marketingName: 'Pro Team',
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
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 users'],
    billingRate: 'monthly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamm',
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: 'yearly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamy',
  },
]

const sentryPlans = [
  {
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Includes 5 seats', 'Unlimited public repositories'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 10,
    benefits: ['Includes 5 seats', 'Unlimited private repositories'],
    monthlyUploadLimit: null,
  },
]

const freePlan = {
  marketingName: 'Free',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', '250 free uploads'],
  monthlyUploadLimit: null,
}

const scheduledPhase = {
  quantity: 0,
  plan: '',
  startDate: 123456789,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: ['Up to # user', 'Unlimited public repositories'],
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

const mockPreTrialPlanInfo = {
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', 'Pre Trial benefits'],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: 'users-basic',
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  jest.resetAllMocks()
})

afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('FreePlanCard', () => {
  function setup(
    {
      owner,
      plans,
      trialStatus = TrialStatuses.CANNOT_TRIAL,
      planValue = 'users-basic',
      flagValue = false,
      planUserCount = 1,
    } = {
      owner: {
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
        numberOfUploads: 10,
      },
      trialStatus: TrialStatuses.CANNOT_TRIAL,
      planValue: 'users-basic',
      plans: allPlans,
      planUserCount: 1,
    }
  ) {
    useFlags.mockReturnValue({
      multipleTiers: flagValue,
    })

    server.use(
      graphql.query('PlanPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner }))
      ),
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                ...mockPlanData,
                trialStatus,
                value: planValue,
                planUserCount,
              },
              pretrialPlan: mockPreTrialPlanInfo,
            },
          })
        )
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner: { availablePlans: plans } }))
      ),
      rest.get('/internal/bb/critical-role/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ numberOfUploads: 250 }))
      )
    )
  }

  describe('rendering component', () => {
    it('renders the plan marketing name', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const marketingName = await screen.findByText(/Free plan/)
      expect(marketingName).toBeInTheDocument()
    })

    it('renders the benefits', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const benefits = await screen.findByText(/Up to 1 user/)
      expect(benefits).toBeInTheDocument()
    })

    it('renders the scheduled phase', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const scheduledPhaseCopy = await screen.findByText(/Scheduled Details/)
      expect(scheduledPhaseCopy).toBeInTheDocument()
    })

    it('renders actions billing button', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const link = await screen.findByRole('link', { name: /Manage plan/ })

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/bb/critical-role/upgrade')
    })

    it('renders the help message', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const helpMessage = await screen.findByText(
        /to discuss custom Enterprise plans/
      )
      expect(helpMessage).toBeInTheDocument()
    })

    it('renders number of uploads', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const uploadCount = await screen.findByText(
        /10 of 250 uploads in the last 30 days/
      )
      expect(uploadCount).toBeInTheDocument()
    })

    it('does not render team plan card if not trialing', () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const teamPlanCard = screen.queryByText(/PlanUpgradeTeam/)
      expect(teamPlanCard).not.toBeInTheDocument()
    })

    it('renders the expected price details for pro team billing', async () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const cost = await screen.findByText(/\$10/)
      expect(cost).toBeInTheDocument()

      const annualBillingText = await screen.findByText(/per user, per month/)
      expect(annualBillingText).toBeInTheDocument()

      const monthlyBillingText = await screen.findByText(
        /billed annually, or \$12 per user billing monthly/
      )
      expect(monthlyBillingText).toBeInTheDocument()
    })

    describe('the user is currently on a trial', () => {
      it('renders downgrade text', async () => {
        setup({
          planValue: 'users-trial',
          trialStatus: TrialStatuses.ONGOING,
          plans: allPlans,
        })

        render(<FreePlanCard plan={freePlan} />, {
          wrapper,
        })

        const text = await screen.findByText(
          /You'll be downgraded to the Developer plan when your trial expires./
        )
        expect(text).toBeInTheDocument()
      })

      it('renders the pretrial benefits', async () => {
        setup({
          planValue: 'users-trial',
          trialStatus: TrialStatuses.ONGOING,
          plans: allPlans,
        })

        render(<FreePlanCard plan={freePlan} />, {
          wrapper,
        })

        const benefitOne = await screen.findByText(/Up to 1 user/)
        expect(benefitOne).toBeInTheDocument()

        const benefitTwo = await screen.findByText(/Pre Trial benefits/)
        expect(benefitTwo).toBeInTheDocument()
      })

      it('renders the team plan component if less than 10 users', async () => {
        setup({
          planValue: 'users-trial',
          trialStatus: TrialStatuses.ONGOING,
          plans: allPlans,
          flagValue: true,
        })

        render(<FreePlanCard plan={freePlan} />, {
          wrapper,
        })

        const teamPlanCard = await screen.findByText(/PlanUpgradeTeam/)
        expect(teamPlanCard).toBeInTheDocument()
      })

      it('does not render the team plan component if more than 10 users', () => {
        setup({
          planValue: 'users-trial',
          trialStatus: TrialStatuses.ONGOING,
          plans: allPlans,
        })

        render(<FreePlanCard plan={freePlan} />, {
          wrapper,
        })

        const teamPlanCard = screen.queryByText(/PlanUpgradeTeam/)
        expect(teamPlanCard).not.toBeInTheDocument()
      })
    })
  })

  describe('user can apply sentry updates', () => {
    it('renders the benefits', async () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
        plans: sentryPlans,
      })

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const benefits = await screen.findByText(/Includes 5 seats/)
      expect(benefits).toBeInTheDocument()
    })

    it('renders actions billing button', async () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
        plans: sentryPlans,
      })

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const upgradeLink = await screen.findByRole('link', {
        name: /Upgrade to Sentry Pro/,
      })
      expect(upgradeLink).toBeInTheDocument()
      expect(upgradeLink).toHaveAttribute(
        'href',
        '/plan/bb/critical-role/upgrade'
      )
    })

    it('renders the expected price details for sentry pro team billing', async () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
        plans: sentryPlans,
      })

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const cost = await screen.findByText(/\$29/)
      expect(cost).toBeInTheDocument()

      const perMonth = await screen.findByText(/\/per month/)
      expect(perMonth).toBeInTheDocument()

      const billingCycleInfo = await screen.findByText(
        /over 5 users is \$10\/per user per month, billed annually/
      )
      expect(billingCycleInfo).toBeInTheDocument()
    })
  })
})
