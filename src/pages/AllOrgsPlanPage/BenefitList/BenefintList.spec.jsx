import { render, screen } from '@testing-library/react'

import BenefitList from './BenefitList'

describe('BenefitList', () => {
  describe('when rendered with benefits', () => {
    it('renders the benefits', () => {
      const props = {
        benefits: ['unlimited users', 'great support'],
        iconName: 'check',
      }
      render(<BenefitList {...props} />)

      const benefit1 = screen.getByText('unlimited users')
      expect(benefit1).toBeInTheDocument()

      const benefit2 = screen.getByText('great support')
      expect(benefit2).toBeInTheDocument()
    })
  })
})
