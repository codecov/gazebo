import { render, screen } from '@testing-library/react'

import PlanPricing from './PlanPricing'

describe('PlanPricing', () => {
  function setup(value) {
    render(<PlanPricing value={value} baseUnitPrice={12} />)
  }

  describe('user is on a free plan', () => {
    beforeEach(() => {
      setup('users-free')
    })

    it('renders price is free', () => {
      expect(screen.getByText('Free')).toBeInTheDocument()
    })
  })

  describe('user is on a pro plan', () => {
    beforeEach(() => {
      setup('users-pr-inappm')
    })

    it('renders the base unit price', () => {
      expect(screen.getByText('$12')).toBeInTheDocument()
    })
  })

  describe('users is on an enterprise plan', () => {
    describe('enterprise plan is monthly', () => {
      beforeEach(() => {
        setup('users-enterprisem')
      })
      it('renders custom pricing', () => {
        expect(screen.getByText('Custom pricing')).toBeInTheDocument()
      })
    })

    describe('enterprise plan is yearly', () => {
      beforeEach(() => {
        setup('users-enterprisey')
      })
      it('renders custom pricing', () => {
        expect(screen.getByText('Custom pricing')).toBeInTheDocument()
      })
    })
  })
})
