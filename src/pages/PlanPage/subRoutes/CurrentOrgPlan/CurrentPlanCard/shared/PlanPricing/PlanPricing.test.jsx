import { render, screen } from '@testing-library/react'

import PlanPricing from './PlanPricing'

describe('PlanPricing', () => {
  describe('user is on a free plan', () => {
    it('renders price is free', () => {
      render(
        <PlanPricing
          plan={{
            isFreePlan: true,
            isEnterprisePlan: false,
            isSentryPlan: false,
          }}
          baseUnitPrice={12}
        />
      )

      const price = screen.getByText('Free')
      expect(price).toBeInTheDocument()
    })
  })

  describe('user is on a pro plan', () => {
    it('renders the base unit price', () => {
      render(
        <PlanPricing
          plan={{
            isFreePlan: false,
            isSentryPlan: false,
            isEnterprisePlan: false,
          }}
          baseUnitPrice={12}
        />
      )

      const price = screen.getByText('$12')
      expect(price).toBeInTheDocument()
    })
  })

  describe('users is on an enterprise plan', () => {
    it('renders custom pricing', () => {
      render(
        <PlanPricing
          plan={{
            isFreePlan: false,
            isEnterprisePlan: true,
            isSentryPlan: false,
          }}
          baseUnitPrice={10}
        />
      )

      const price = screen.getByText('Custom pricing')
      expect(price).toBeInTheDocument()
    })
  })

  describe('user is on a sentry plan', () => {
    it('renders the base unit price', () => {
      render(
        <PlanPricing
          plan={{
            isFreePlan: false,
            isEnterprisePlan: false,
            isSentryPlan: true,
          }}
          baseUnitPrice={12}
        />
      )

      const price = screen.getByText(/\$29/)
      expect(price).toBeInTheDocument()
    })
  })
})
