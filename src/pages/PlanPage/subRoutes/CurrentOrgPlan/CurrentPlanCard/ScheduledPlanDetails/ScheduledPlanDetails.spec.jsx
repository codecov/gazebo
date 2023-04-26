import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ScheduledPlanDetails from './ScheduledPlanDetails'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

describe('ScheduledPlanDetails', () => {
  function setup(scheduledPhase) {
    /*Let's try to git rid of unnecessary wrappers*/

    render(
      <QueryClientProvider client={queryClient}>
        <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
      </QueryClientProvider>,
      {
        wrapper: MemoryRouter,
      }
    )
  }

  describe('when rendering with a pro plan', () => {
    beforeEach(() => {
      setup({
        plan: 'annual',
        quantity: 14,
        startDate: 1642105987,
      })
    })

    it('renders plan', () => {
      expect(screen.getByText(/annual/)).toBeInTheDocument()
    })

    it('renders quantity', () => {
      expect(screen.getByText(/14/)).toBeInTheDocument()
    })

    it('renders start date in human readable', () => {
      expect(screen.getByText(/January 13th 2022/)).toBeInTheDocument()
    })
  })
})
