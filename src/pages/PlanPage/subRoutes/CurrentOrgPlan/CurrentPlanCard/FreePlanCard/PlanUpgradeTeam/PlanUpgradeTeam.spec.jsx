import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'

import PlanUpgradeTeam from './PlanUpgradeTeam'

jest.mock('shared/plan/BenefitList', () => () => 'BenefitsList')

const mockPlanBasic = {
  baseUnitPrice: 0,
  benefits: ['Up to # user', 'Unlimited public repositories'],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
}

const mockPlanPro = {
  baseUnitPrice: 10,
  benefits: ['Up to # user', 'Unlimited public repositories'],
  billingRate: 'monthly',
  marketingName: 'Pro',
  monthlyUploadLimit: null,
  planName: 'users-pr-inappm',
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 4,
}

const mockAvailablePlans = [
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 users'],
    billingRate: 'monthly',
    marketingName: 'Team',
    monthlyUploadLimit: 2500,
    planName: 'users-teamm',
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: 'yearly',
    marketingName: 'Team',
    monthlyUploadLimit: 2500,
    planName: 'users-teamy',
  },
]

const mockPreTrialPlanInfo = {
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', 'Pre Trial benefits'],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  planName: 'users-basic',
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

describe('PlanUpgradeTeam', () => {
  function setup({ plan = mockPlanBasic } = { plan: mockPlanBasic }) {
    server.use(
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: mockAvailablePlans,
              pretrialPlan: mockPreTrialPlanInfo,
              plan,
            },
          })
        )
      )
    )
  }

  describe('when rendered with basic plan', () => {
    beforeEach(() => {
      setup({ plan: mockPlanBasic })
    })
    it('shows the monthly marketing name', async () => {
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const marketingName = await screen.findByText(/Team plan/)
      expect(marketingName).toBeInTheDocument()
    })

    it('show the benefits list', async () => {
      setup()
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const benefitsIncludes = await screen.findByText(/Includes/)
      expect(benefitsIncludes).toBeInTheDocument()

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows pricing for monthly card', async () => {
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
      render(<PlanUpgradeTeam />, {
        wrapper,
      })

      const buttonText = await screen.findByText(/Upgrade to Team/)
      expect(buttonText).toBeInTheDocument()
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
