import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'

import PaidPlanCard from './PaidPlanCard'

jest.mock(
  '../shared/ActionsBilling/ActionsBilling',
  () => () => 'Actions Billing'
)
jest.mock('../shared/PlanPricing', () => () => 'Plan Pricing')
jest.mock('shared/plan/BenefitList', () => () => 'BenefitsList')
jest.mock(
  'shared/plan/ScheduledPlanDetails',
  () => () => 'Scheduled Plan Details'
)

const mockProPlan = {
  marketingName: 'Pro',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 0,
  benefits: ['Unlimited public repositories', 'Unlimited private repositories'],
  planUserCount: 5,
  monthlyUploadLimit: null,
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
}

const mockTeamPlan = {
  marketingName: 'Team',
  value: 'users-teamm',
  billingRate: 'monthly',
  baseUnitPrice: 123,
  benefits: ['Team benefits', 'Unlimited private repositories'],
  planUserCount: 8,
  monthlyUploadLimit: null,
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
}

const mockScheduleDetail = {
  id: 'test_sub_sched_123',
  scheduled_phase: {
    plan: 'annually',
    quantity: 5,
    start_date: 1724258944,
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('PaidPlanCard', () => {
  function setup(
    { hasScheduledDetails = false, plan = mockProPlan } = {
      hasScheduledDetails: false,
      plan: mockProPlan,
    }
  ) {
    server.use(
      rest.get(
        '/internal/bb/critical-role/account-details/',
        (req, res, ctx) => {
          if (hasScheduledDetails) {
            return res(
              ctx.status(200),
              ctx.json({ scheduleDetail: mockScheduleDetail })
            )
          } else {
            return res(ctx.status(200), ctx.json({}))
          }
        }
      ),
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              hasPrivateRepos: true,
              plan,
            },
          })
        )
      )
    )
  }

  describe('When rendered for a pro plan', () => {
    beforeEach(() => {
      setup({ plan: mockProPlan })
    })

    it('renders the plan marketing name', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const planValue = await screen.findByText(/Pro plan/)
      expect(planValue).toBeInTheDocument()
    })

    it('renders the benefits', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('renders seats number', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const seats = await screen.findByText(/plan has 5 seats/)
      expect(seats).toBeInTheDocument()
    })

    it('renders the plan pricing', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const planPricing = await screen.findByText(/Plan Pricing/)
      expect(planPricing).toBeInTheDocument()
    })

    it('renders actions billing button', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const actionsBilling = await screen.findByText(/Actions Billing/)
      expect(actionsBilling).toBeInTheDocument()
    })
  })

  describe('When rendered for a team plan', () => {
    beforeEach(() => {
      setup({ plan: mockTeamPlan })
    })

    it('renders the plan marketing name', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const planValue = await screen.findByText(/Team plan/)
      expect(planValue).toBeInTheDocument()
    })

    it('renders the benefits', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('renders seats number', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const seats = await screen.findByText(/plan has 8 seats/)
      expect(seats).toBeInTheDocument()
    })

    it('renders the plan pricing', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const planPricing = await screen.findByText(/Plan Pricing/)
      expect(planPricing).toBeInTheDocument()
    })

    it('renders actions billing button', async () => {
      render(<PaidPlanCard />, {
        wrapper,
      })

      const actionsBilling = await screen.findByText(/Actions Billing/)
      expect(actionsBilling).toBeInTheDocument()
    })
  })

  describe('When rendered with scheduled details', () => {
    it('renders the scheduled details', async () => {
      setup({ hasScheduledDetails: true })
      render(<PaidPlanCard />, {
        wrapper,
      })

      const scheduledPlanDetails = await screen.findByText(
        /Scheduled Plan Details/
      )
      expect(scheduledPlanDetails).toBeInTheDocument()
    })
  })
})
