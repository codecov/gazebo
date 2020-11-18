import { render, screen } from '@testing-library/react'

import BenefitList from './BenefitList'

const benefits = ['unlimited users', 'great support']

describe('BenefitList', () => {
  function setup() {
    const props = {
      benefits,
      iconName: 'check',
    }
    render(<BenefitList {...props} />)
  }

  describe('when rendered with benefints', () => {
    beforeEach(setup)

    it('renders the benefits', () => {
      expect(screen.getByText(benefits[0])).toBeInTheDocument()
      expect(screen.getByText(benefits[1])).toBeInTheDocument()
    })
  })
})
