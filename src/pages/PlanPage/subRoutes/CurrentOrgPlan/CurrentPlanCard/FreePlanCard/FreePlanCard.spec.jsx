import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { useFlags } from 'shared/featureFlags'

import FreePlanCard from './FreePlanCard'

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
      'Priorty Support',
    ],
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
      'Priorty Support',
    ],
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
      'Priorty Support',
    ],
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
      'Priorty Support',
    ],
  },
]

const sentryPlans = [
  {
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Up to # user', 'Unlimited public repositories'],
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 10,
    benefits: ['Up to # user', 'Unlimited private repositories'],
  },
]

const freePlan = {
  marketingName: 'Free',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', '250 free uploads'],
}

const sentryPlan = {
  marketingName: 'Sentry',
  value: 'users-sentrym',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to # user', 'Unlimited public repositories'],
}

const scheduledPhase = {
  quantity: 0,
  plan: '',
  startDate: 123456789,
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
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
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('FreePlanCard', () => {
  function setup(
    { owner, plans, trialStatus, planValue, trialFlag } = {
      owner: {
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
        numberOfUploads: 10,
      },
      trialFlag: false,
      trialStatus: TrialStatuses.CANNOT_TRIAL,
      planValue: 'users-basic',
      plans: allPlans,
    }
  ) {
    useFlags.mockReturnValue({ codecovTrialMvp: trialFlag })

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
                planName: planValue,
              },
            },
          })
        )
      ),
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      ),
      rest.get('/internal/bb/critical-role/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ numberOfUploads: 250 }))
      )
    )
  }

  describe('rendering component', () => {
    it('renders the plan marketing name', () => {
      setup()

      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Free plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const benefits = screen.getByText(/Up to 1 user/)
      expect(benefits).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      setup()

      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const scheduledPhaseCopy = screen.getByText(/Scheduled Details/)
      expect(scheduledPhaseCopy).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const link = screen.getByRole('link', { name: /Manage plan/ })

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/bb/critical-role/upgrade')
    })

    it('renders the help message', () => {
      setup()

      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      const helpMessage = screen.getByText(/to discuss custom Enterprise plans/)
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

    describe('flag is set to true', () => {
      describe('the user is currently on a trial', () => {
        it('renders downgrade text', async () => {
          setup({
            planValue: 'users-trial',
            trialStatus: TrialStatuses.ONGOING,
            trialFlag: true,
            plans: allPlans,
          })

          render(<FreePlanCard plan={freePlan} />, {
            wrapper,
          })

          const text = await screen.findByText(
            /You'll be downgraded to this plan/
          )
          expect(text).toBeInTheDocument()
        })
      })
    })
  })

  describe('user can apply sentry updates', () => {
    it('renders the benefits', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
        plans: sentryPlans,
      })

      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      const benefits = screen.getByText(/Up to # user/)
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

      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      const upgradeLink = await screen.findByRole('link', {
        name: /Upgrade to Sentry Pro Team plan/,
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
