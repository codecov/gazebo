import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import ProPlanCard from './ProPlanCard'

const proPlan = {
  marketingName: 'Pro Team',
  value: 'users-pr',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Unlimited public repositories', 'Unlimited private repositories'],
  quantity: 5,
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

describe('ProPlanCard', () => {
  describe('When rendered', () => {
    it('renders the plan marketing name', () => {
      render(<ProPlanCard plan={proPlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const planValue = screen.getByText(/Pro Team plan/)
      expect(planValue).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<ProPlanCard plan={proPlan} />, {
        wrapper,
      })

      const benefits = screen.getByText(/Unlimited public repositories/)
      expect(benefits).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      render(<ProPlanCard plan={proPlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const scheduledPhaseCopy = screen.getByText(/Scheduled Details/)
      expect(scheduledPhaseCopy).toBeInTheDocument()
    })

    it('renders seats number', () => {
      render(<ProPlanCard plan={proPlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      const seats = screen.getByText(/plan has 5 seats/)
      expect(seats).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      render(<ProPlanCard plan={proPlan} />, {
        wrapper,
      })

      const link = screen.getByRole('link', { name: /Manage plan/ })

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/bb/critical-role/upgrade')
    })
  })
})
