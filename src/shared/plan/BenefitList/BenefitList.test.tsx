import { render, screen } from '@testing-library/react'

import BenefitList from './BenefitList'

const benefits = ['unlimited users', 'great support']

describe('BenefitList', () => {
  describe('when rendered with benefits', () => {
    it('renders the benefits', () => {
      render(<BenefitList benefits={benefits} iconName="check" />)

      const benefitList = screen.getByRole('list')
      expect(benefitList).toBeInTheDocument()

      const benefitItems = screen.getAllByRole('listitem')
      expect(benefitItems).toHaveLength(benefits.length)

      benefits.forEach((benefit) => {
        expect(screen.getByText(benefit)).toBeInTheDocument()
      })
    })
  })
})
