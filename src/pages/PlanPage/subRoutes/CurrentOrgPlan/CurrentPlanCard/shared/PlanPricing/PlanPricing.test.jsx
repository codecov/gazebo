import { render, screen } from '@testing-library/react'

import { Plans } from 'shared/utils/billing'

import PlanPricing from './PlanPricing'

describe('PlanPricing', () => {
  describe('user is on a free plan', () => {
    it('renders price is free', () => {
      render(
        <PlanPricing
          plan={{ isFreePlan: true }}
          value={Plans.USERS_FREE}
          baseUnitPrice={12}
        />
      )

      const price = screen.getByText('Free')
      expect(price).toBeInTheDocument()
    })
  })

  describe('user is on a basic plan', () => {
    it('renders price is free', () => {
      render(
        <PlanPricing
          plan={{ isFreePlan: true }}
          value={Plans.USERS_BASIC}
          baseUnitPrice={12}
        />
      )

      const price = screen.getByText('Free')
      expect(price).toBeInTheDocument()
    })
  })

  describe('user is on a pro plan', () => {
    describe('monthly pro plan', () => {
      describe('old pro plan', () => {
        it('renders the base unit price', () => {
          render(<PlanPricing value={Plans.USERS_INAPP} baseUnitPrice={12} />)

          const price = screen.getByText('$12')
          expect(price).toBeInTheDocument()
        })
      })

      describe('new pro plan', () => {
        it('renders the base unit price', () => {
          render(
            <PlanPricing value={Plans.USERS_PR_INAPPM} baseUnitPrice={12} />
          )

          const price = screen.getByText('$12')
          expect(price).toBeInTheDocument()
        })
      })
    })

    describe('annual pro plan', () => {
      describe('old pro plan', () => {
        it('renders the base unit price', () => {
          render(<PlanPricing value={Plans.USERS_INAPPY} baseUnitPrice={10} />)

          const price = screen.getByText('$10')
          expect(price).toBeInTheDocument()
        })
      })

      describe('new pro plan', () => {
        it('renders the base unit price', () => {
          render(
            <PlanPricing value={Plans.USERS_PR_INAPPY} baseUnitPrice={10} />
          )

          const price = screen.getByText('$10')
          expect(price).toBeInTheDocument()
        })
      })
    })
  })

  describe('users is on an enterprise plan', () => {
    describe('enterprise plan is monthly', () => {
      it('renders custom pricing', () => {
        render(
          <PlanPricing
            plan={{ isEnterprisePlan: true }}
            value={Plans.USERS_ENTERPRISEM}
            baseUnitPrice={10}
          />
        )

        const price = screen.getByText('Custom pricing')
        expect(price).toBeInTheDocument()
      })
    })

    describe('enterprise plan is yearly', () => {
      it('renders custom pricing', () => {
        render(
          <PlanPricing
            plan={{ isEnterprisePlan: true }}
            value={Plans.USERS_ENTERPRISEY}
            baseUnitPrice={10}
          />
        )

        const price = screen.getByText('Custom pricing')
        expect(price).toBeInTheDocument()
      })
    })
  })

  describe('user is on a sentry plan', () => {
    describe('annual sentry plan', () => {
      it('renders the base unit price', () => {
        render(<PlanPricing value={Plans.USERS_SENTRYY} baseUnitPrice={10} />)

        const basePrice = screen.getByText(/\$29/)
        expect(basePrice).toBeInTheDocument()
      })
    })

    describe('monthly sentry plan', () => {
      it('renders the base unit price', () => {
        render(<PlanPricing value={Plans.USERS_SENTRYY} baseUnitPrice={12} />)

        const price = screen.getByText(/\$29/)
        expect(price).toBeInTheDocument()
      })
    })
  })
})
