import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import TeamPlanCard from './TeamPlanCard'

vi.mock('shared/plan/BenefitList', () => ({ default: () => 'BenefitsList' }))

const mockAvailablePlans = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_DEVELOPER,
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
    isTeamPlan: false,
    isSentryPlan: false,
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
    isTeamPlan: false,
    isSentryPlan: false,
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
    isTeamPlan: false,
    isSentryPlan: false,
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
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 paid users'],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMM,
    isTeamPlan: true,
    isSentryPlan: false,
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 paid users'],
    billingRate: BillingRate.ANNUALLY,
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMY,
    isTeamPlan: true,
    isSentryPlan: false,
  },
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('TeamPlanCard', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: { owner: { availablePlans: mockAvailablePlans } },
        })
      })
    )
  }

  it('shows the monthly marketing name', async () => {
    setup()
    render(<TeamPlanCard />, {
      wrapper,
    })

    const marketingName = await screen.findByText(/Users Team/)
    expect(marketingName).toBeInTheDocument()
  })

  it('show the benefits list', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const benefitsIncludes = await screen.findByText(/Includes/)
    expect(benefitsIncludes).toBeInTheDocument()

    const benefitsList = await screen.findByText(/BenefitsList/)
    expect(benefitsList).toBeInTheDocument()
  })

  it('shows pricing for monthly card', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const monthlyPrice = await screen.findByText(/6/)
    expect(monthlyPrice).toBeInTheDocument()

    const auxiliaryText = await screen.findByText(/billed monthly/)
    expect(auxiliaryText).toBeInTheDocument()
  })

  it('shows action button', async () => {
    setup()

    render(<TeamPlanCard />, {
      wrapper,
    })

    const actionButton = await screen.findByRole('link', {
      name: /Change to Team plan/,
    })
    expect(actionButton).toBeInTheDocument()
    expect(actionButton).toHaveAttribute(
      'href',
      '/plan/bb/critical-role/upgrade?plan=team'
    )
  })
})
