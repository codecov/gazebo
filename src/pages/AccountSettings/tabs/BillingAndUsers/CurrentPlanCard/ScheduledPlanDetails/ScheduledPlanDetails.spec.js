import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import ScheduledPlanDetails from './ScheduledPlanDetails'
import { QueryClientProvider, QueryClient } from 'react-query'

const queryClient = new QueryClient()

describe('ScheduledPlanDetails', () => {
  function setup(scheduledPhase) {
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