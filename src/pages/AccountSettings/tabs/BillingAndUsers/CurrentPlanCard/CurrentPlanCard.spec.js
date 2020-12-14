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

const freeAccountDetails = {
  plan: {
    marketingName: 'Basic',
    value: 'users-free',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
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
      expect(screen.getByText(/\$12/)).toBeInTheDocument()
    })

    it('renders the link to Cancel', () => {
      expect(
        screen.getByRole('link', { name: /Cancel Plan/ })
      ).toBeInTheDocument()
    })
  })

  describe('when rendering with a free plan', () => {
    beforeEach(() => {
      setup(freeAccountDetails)
    })

    it('doesnt render the link to Cancel', () => {
      expect(
        screen.queryByRole('link', { name: /Cancel Plan/ })
      ).not.toBeInTheDocument()
    })
  })

  describe('when the subscription of the user is expiring', () => {
    beforeEach(() => {
      setup({
        ...proAccountDetails,
        subscriptionDetail: {
          cancelAtPeriodEnd: true,
        },
      })
    })

    it('doesnt render the link to Cancel', () => {
      expect(
        screen.queryByRole('link', { name: /Cancel Plan/ })
      ).not.toBeInTheDocument()
    })
  })
})
