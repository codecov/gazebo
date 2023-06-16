import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CurrentPlanCard from './CurrentPlanCard'

jest.mock('./FreePlanCard', () => () => 'Free plan card')
jest.mock('./ProPlanCard', () => () => 'Pro plan card')
jest.mock('./EnterprisePlanCard', () => () => 'Enterprise plan card')

const proPlanDetails = {
  marketingName: 'Pro Team',
  baseUnitPrice: 12,
  benefits: ['Configureable # of users', 'Unlimited repos'],
  quantity: 5,
  value: 'users-inappm',
}

const freePlanDetails = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
}

const enterprisePlan = {
  marketingName: 'Enterprise',
  value: 'users-enterprisey',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Unlimited users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
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

describe('CurrentPlanCard', () => {
  describe('When rendered with free plan', () => {
    it('renders the correct plan card', () => {
      render(<CurrentPlanCard plan={freePlanDetails} />, {
        wrapper,
      })

      expect(screen.getByText(/Free plan card/)).toBeInTheDocument()
    })
  })

  describe('When rendered with pro plan', () => {
    it('renders the correct plan card', () => {
      render(<CurrentPlanCard accountDetails={proPlanDetails} />, {
        wrapper,
      })

      expect(screen.getByText(/Pro plan card/)).toBeInTheDocument()
    })
  })

  describe('When rendered with enterprise plan', () => {
    it('renders the correct plan card', () => {
      render(<CurrentPlanCard plan={enterprisePlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Enterprise plan card/)).toBeInTheDocument()
    })
  })
})
