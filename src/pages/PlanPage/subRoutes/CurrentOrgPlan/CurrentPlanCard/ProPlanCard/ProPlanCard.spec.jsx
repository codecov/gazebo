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

      expect(screen.getByText(/Pro Team plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<ProPlanCard plan={proPlan} />, {
        wrapper,
      })

      expect(
        screen.getByText(/Unlimited public repositories/)
      ).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      render(<ProPlanCard plan={proPlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Scheduled Details/)).toBeInTheDocument()
    })

    it('renders seats number', () => {
      render(<ProPlanCard plan={proPlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/plan has 5 seats/)).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      render(<ProPlanCard plan={proPlan} />, {
        wrapper,
      })

      expect(
        screen.getByRole('link', { name: /Manage plan/ })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: /Manage plan/ })).toHaveAttribute(
        'href',
        '/plan/bb/critical-role/upgrade'
      )
    })
  })
})
