import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import PlanUpgradeTeam from './PlanUpgradeTeam'

vi.mock('shared/plan/BenefitList', () => ({ default: () => 'BenefitsList' }))

const mockPlanBasic = {
  isEnterprisePlan: false,
  isFreePlan: true,
  isProPlan: false,
  baseUnitPrice: 0,
  benefits: ['Up to # user', 'Unlimited public repositories'],
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

const mockPlanPro = {
  isEnterprisePlan: false,
  isProPlan: true,
  isFreePlan: false,
  baseUnitPrice: 10,
  benefits: ['Up to # user', 'Unlimited public repositories'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Pro',
  monthlyUploadLimit: null,
  value: Plans.USERS_PR_INAPPM,
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 4,
  hasSeatsLeft: true,
}

const mockPlanTrialing = {
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: false,
  baseUnitPrice: 10,
  benefits: ['Up to # user', 'Unlimited public repositories'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Trial',
  monthlyUploadLimit: null,
  value: Plans.USERS_TRIAL,
  trialStatus: TrialStatuses.ONGOING,
  trialStartDate: '2023-01-01T08:55:25',
  trialEndDate: '2023-01-10T08:55:25',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 4,
  hasSeatsLeft: true,
}

const mockAvailablePlans = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_BASIC,
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
  },
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 users'],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMM,
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: BillingRate.ANNUALLY,
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMY,
  },
]

const mockPreTrialPlanInfo = {
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', 'Pre Trial benefits'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: Plans.USERS_BASIC,
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
  vi.clearAllMocks()
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

describe('PlanUpgradeTeam', () => {
  function setup({ plan = mockPlanBasic } = { plan: mockPlanBasic }) {
    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              pretrialPlan: mockPreTrialPlanInfo,
              plan,
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: { owner: { availablePlans: mockAvailablePlans } },
        })
      })
    )
  }

  describe('when rendered with basic plan', () => {
    it('shows the monthly marketing name', async () => {
      setup({ plan: mockPlanBasic })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const marketingName = await screen.findByText(/Team plan/)
      expect(marketingName).toBeInTheDocument()
    })

    it('shows link to learn more plan page', async () => {
      setup({ plan: mockPlanBasic })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const learnMoreLink = await screen.findByRole('link', {
        name: /learn more/i,
      })
      expect(learnMoreLink).toBeInTheDocument()
      expect(learnMoreLink.href).toBe(
        'https://about.codecov.io/team-plan-compare'
      )
    })

    it('show the benefits list', async () => {
      setup({ plan: mockPlanBasic })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const benefitsIncludes = await screen.findByText(/Includes/)
      expect(benefitsIncludes).toBeInTheDocument()

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows pricing for monthly card', async () => {
      setup({ plan: mockPlanBasic })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const yearlyPrice = await screen.findByText(/5/)
      expect(yearlyPrice).toBeInTheDocument()

      const monthlyPrice = await screen.findByText(/6/)
      expect(monthlyPrice).toBeInTheDocument()

      const auxiliaryText = await screen.findByText(/per user billing monthly/)
      expect(auxiliaryText).toBeInTheDocument()
    })

    it('shows upgrade to team when plan is basic', async () => {
      setup({ plan: mockPlanBasic })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const upgradeButton = await screen.findByRole('link', {
        name: /Upgrade/,
      })
      expect(upgradeButton).toBeInTheDocument()
      expect(upgradeButton).toHaveAttribute(
        'href',
        '/plan/bb/critical-role/upgrade?plan=team'
      )
    })

    it('shows upgrade to team when plan is trial', async () => {
      setup({ plan: mockPlanTrialing })
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const upgradeButton = await screen.findByRole('link', {
        name: /Upgrade/,
      })
      expect(upgradeButton).toBeInTheDocument()
      expect(upgradeButton).toHaveAttribute(
        'href',
        '/plan/bb/critical-role/upgrade?plan=team'
      )
    })
  })

  describe('when rendered with non-basic plan', () => {
    beforeEach(() => {
      setup({ plan: mockPlanPro })
    })

    it('shows manage when plan is not basic', async () => {
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const buttonText = await screen.findByText(/Manage plan/)
      expect(buttonText).toBeInTheDocument()
    })
  })
})
