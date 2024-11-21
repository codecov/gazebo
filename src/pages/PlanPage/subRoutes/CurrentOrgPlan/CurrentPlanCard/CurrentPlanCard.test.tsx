import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { PlanName, Plans } from 'shared/utils/billing'

import CurrentPlanCard from './CurrentPlanCard'

vi.mock('./FreePlanCard', () => ({ default: () => 'Free plan card' }))
vi.mock('./PaidPlanCard', () => ({ default: () => 'Paid plan card' }))
vi.mock('./EnterprisePlanCard', () => ({
  default: () => 'Enterprise plan card',
}))

const proPlanDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: Plans.USERS_PR_INAPPM,
    billingRate: null,
  },
}

const freePlanDetails = {
  plan: {
    marketingName: 'Basic',
    value: Plans.USERS_FREE,
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
}

const enterprisePlan = {
  plan: {
    marketingName: 'Enterprise',
    value: Plans.USERS_ENTERPRISEY,
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Unlimited users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
}

const usesInvoiceTeamPlan = {
  plan: {
    marketingName: 'blah',
    value: Plans.USERS_TEAMM,
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Unlimited users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
  usesInvoice: true,
}

const trialPlanDetails = {
  plan: {
    marketingName: 'Pro Trial Team',
    baseUnitPrice: 12,
    billingRate: null,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: Plans.USERS_TRIAL,
  },
}

interface TestPlan {
  plan: {
    marketingName: string
    value: PlanName
    billingRate: null
    baseUnitPrice: number
    benefits: string[]
  }
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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

describe('CurrentPlanCard', () => {
  function setup(planDetails: TestPlan = freePlanDetails) {
    server.use(
      http.get('/internal/bb/critical-role/account-details/', () => {
        return HttpResponse.json(planDetails)
      })
    )
  }

  describe('rendered with free plan', () => {
    it('renders the correct plan card', async () => {
      setup()

      render(<CurrentPlanCard />, {
        wrapper,
      })

      const freePlanCard = await screen.findByText(/Free plan card/)
      expect(freePlanCard).toBeInTheDocument()
    })
  })

  describe('rendered with trial plan', () => {
    it('renders the correct plan card', async () => {
      setup(trialPlanDetails)

      render(<CurrentPlanCard />, {
        wrapper,
      })

      const freePlanCard = await screen.findByText(/Free plan card/)
      expect(freePlanCard).toBeInTheDocument()
    })
  })

  describe('rendered with pro plan', () => {
    it('renders the correct plan card', async () => {
      setup(proPlanDetails)

      render(<CurrentPlanCard />, {
        wrapper,
      })

      const PaidPlanCard = await screen.findByText(/Paid plan card/)
      expect(PaidPlanCard).toBeInTheDocument()
    })
  })

  describe('rendered with enterprise plan', () => {
    it('renders the correct plan card', async () => {
      setup(enterprisePlan)

      render(<CurrentPlanCard />, {
        wrapper,
      })

      const enterpriseCard = await screen.findByText(/Enterprise plan card/)
      expect(enterpriseCard).toBeInTheDocument()
    })

    it('renders enterprise plan card when usesInvoice True', async () => {
      setup(usesInvoiceTeamPlan)

      render(<CurrentPlanCard />, {
        wrapper,
      })

      const usesInvoiceEnterprise =
        await screen.findByText(/Enterprise plan card/)
      expect(usesInvoiceEnterprise).toBeInTheDocument()
    })
  })
})
