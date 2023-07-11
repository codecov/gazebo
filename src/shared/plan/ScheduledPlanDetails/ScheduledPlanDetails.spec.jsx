import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ScheduledPlanDetails from './ScheduledPlanDetails'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
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

      expect(screen.getByText(/annual/)).toBeInTheDocument()
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

      expect(screen.getByText(/14/)).toBeInTheDocument()
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

      expect(screen.getByText(/January 13th 2022/)).toBeInTheDocument()
    })
  })
})
