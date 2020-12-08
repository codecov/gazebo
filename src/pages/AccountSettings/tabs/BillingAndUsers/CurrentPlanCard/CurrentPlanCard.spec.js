import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CurrentPlanCard from './CurrentPlanCard'

const proAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configureable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

describe('CurrentPlanCard', () => {
  function setup(accountDetails) {
    render(<CurrentPlanCard accountDetails={accountDetails} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendering with a pro plan', () => {
    beforeEach(() => {
      setup(proAccountDetails)
    })

    it('renders the price of the plan', () => {
      const tab = screen.getByText(/\$12/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the link to Cancel', () => {
      const tab = screen.getByText(/Cancel/)
      expect(tab).toBeInTheDocument()
    })
  })
})
