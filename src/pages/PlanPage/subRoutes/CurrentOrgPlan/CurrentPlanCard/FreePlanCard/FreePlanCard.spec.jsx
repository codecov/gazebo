import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import FreePlanCard from './FreePlanCard'

const freePlan = {
  marketingName: 'Free',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', '250 free uploads'],
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

describe('FreePlanCard', () => {
  describe('When rendered', () => {
    it('renders the plan marketing name', () => {
      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Free plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Up to 1 user/)).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Scheduled Details/)).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      render(<FreePlanCard plan={freePlan} />, {
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

    it('renders the help message', () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(
        screen.getByText(/to discuss custom Enterprise plans/)
      ).toBeInTheDocument()
    })
  })
})
