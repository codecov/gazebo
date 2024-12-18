import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plan, PretrialPlan, TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import PaidPlanCard from './PaidPlanCard'

vi.mock('../shared/ActionsBilling/ActionsBilling', () => ({
  default: () => 'Actions Billing',
}))
vi.mock('../shared/PlanPricing', () => ({
  default: () => 'Plan Pricing',
}))
vi.mock('shared/plan/BenefitList', () => ({
  default: () => 'BenefitsList',
}))
vi.mock('shared/plan/ScheduledPlanDetails', () => ({
  default: () => 'Scheduled Plan Details',
}))

const mockProPlan = {
  isEnterprisePlan: false,
  isFreePlan: false,
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 0,
  benefits: ['Unlimited public repositories', 'Unlimited private repositories'],
  planUserCount: 5,
  monthlyUploadLimit: null,
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  hasSeatsLeft: true,
}

const mockTeamPlan = {
  isEnterprisePlan: false,
  isFreePlan: false,
  marketingName: 'Team',
  value: Plans.USERS_TEAMM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 123,
  benefits: ['Team benefits', 'Unlimited private repositories'],
  planUserCount: 8,
  monthlyUploadLimit: 2500,
  trialStatus: TrialStatuses.CANNOT_TRIAL,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  hasSeatsLeft: true,
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
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
          <Route path="/plan/:provider/:owner">{children}</Route>
        </MemoryRouter>
      </Suspense>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  hasScheduledDetails?: boolean
  plan?: Plan | PretrialPlan
}

describe('PaidPlanCard', () => {
  function setup({
    hasScheduledDetails = false,
    plan = mockProPlan,
  }: SetupArgs) {
    server.use(
      http.get('/internal/:provider/:owner/account-details/', () => {
        if (hasScheduledDetails) {
          return HttpResponse.json({
            scheduleDetail: mockScheduleDetail,
          })
        }
        return HttpResponse.json({ data: {} })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: { hasPrivateRepos: true, plan },
          },
        })
      }),
      graphql.query('PlanPageData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              username: 'popcorn',
              isCurrentUserPartOfOrg: true,
              numberOfUploads: 123,
            },
          },
        })
      })
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

      const planPricing = await screen.findByText(/Pricing/)
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

  describe('Number of uploads', () => {
    it('shows for team plan', async () => {
      setup({ plan: mockTeamPlan })
      render(<PaidPlanCard />, {
        wrapper,
      })

      const numberOfUploads = await screen.findByText(
        /123 of 2500 uploads in the last 30 days/
      )
      expect(numberOfUploads).toBeInTheDocument()
    })

    it('does not show for pro plan', async () => {
      setup({})
      render(<PaidPlanCard />, {
        wrapper,
      })

      const numberOfUploads = screen.queryByText(
        /123 of 2500 uploads in the last 30 days/
      )
      expect(numberOfUploads).not.toBeInTheDocument()
    })
  })
})
