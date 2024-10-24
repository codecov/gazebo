import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ScheduledPlanDetails from './ScheduledPlanDetails'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('ScheduledPlanDetails', () => {
  describe('when rendering with a pro plan', () => {
    it('renders plan', () => {
      render(
        <ScheduledPlanDetails
          scheduledPhase={{
            plan: 'annual',
            quantity: 14,
            startDate: 1642105987,
          }}
        />,
        { wrapper }
      )

      const plan = screen.getByText(/annual/)
      expect(plan).toBeInTheDocument()
    })

    it('renders quantity', () => {
      render(
        <ScheduledPlanDetails
          scheduledPhase={{
            plan: 'annual',
            quantity: 14,
            startDate: 1642105987,
          }}
        />,
        { wrapper }
      )

      const quantity = screen.getByText(/14/)
      expect(quantity).toBeInTheDocument()
    })

    it('renders start date in human readable', () => {
      render(
        <ScheduledPlanDetails
          scheduledPhase={{
            plan: 'annual',
            quantity: 14,
            startDate: 1642105987,
          }}
        />,
        { wrapper }
      )

      const startDate = screen.getByText(/January 13th 2022/)
      expect(startDate).toBeInTheDocument()
    })
  })
})
