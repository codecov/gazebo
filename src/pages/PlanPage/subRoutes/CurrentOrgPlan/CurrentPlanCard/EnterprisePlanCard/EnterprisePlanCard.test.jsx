import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import EnterprisePlanCard from './EnterprisePlanCard'

const enterprisePlan = {
  marketingName: 'Enterprise',
  value: Plans.USERS_ENTERPRISEY,
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Unlimited users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
}

const scheduledPhase = {
  quantity: 0,
  plan: '',
  startDate: 123456789,
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

describe('EnterprisePlanCard', () => {
  describe('When rendered', () => {
    it('renders the plan marketing name', () => {
      render(
        <EnterprisePlanCard
          plan={enterprisePlan}
          scheduledPhase={scheduledPhase}
        />,
        {
          wrapper,
        }
      )

      expect(screen.getByText(/Enterprise plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<EnterprisePlanCard plan={enterprisePlan} />, {
        wrapper,
      })

      const benefits = screen.getByText(/Unlimited users/)
      expect(benefits).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      render(
        <EnterprisePlanCard
          plan={enterprisePlan}
          scheduledPhase={scheduledPhase}
        />,
        {
          wrapper,
        }
      )

      const scheduledPhaseCopy = screen.getByText(/Scheduled/)
      expect(scheduledPhaseCopy).toBeInTheDocument()
    })

    it('renders the help message', () => {
      render(<EnterprisePlanCard plan={enterprisePlan} />, {
        wrapper,
      })

      const helpMessage = screen.getByText(
        /For help or changes to plan, connect with/
      )

      expect(helpMessage).toBeInTheDocument()
    })
  })
})
