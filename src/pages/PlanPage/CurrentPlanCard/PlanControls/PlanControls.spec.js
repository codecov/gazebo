import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom/cjs/react-router-dom.min'

import PlanControls from './PlanControls'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ provider: 'gh' }),
}))

describe('PlanPricing', () => {
  function setup(value) {
    const accountDetails = {
      plan: {
        marketingName: 'Team Name',
        baseUnitPrice: 12,
        benefits: [],
        quantity: 5,
        value,
      },
      activatedUserCount: 2,
    }
    render(<PlanControls accountDetails={accountDetails} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('user is on an enterprise plan', () => {
    describe('user is on a monthly plan', () => {
      beforeEach(() => {
        setup('users-enterprisem')
      })

      it('renders contact message', () => {
        expect(
          screen.getByText('To change or cancel your plan please contact')
        ).toBeInTheDocument()
      })
    })

    describe('user is on a yearly plan', () => {
      beforeEach(() => {
        setup('users-enterprisey')
      })

      it('renders contact message', () => {
        expect(
          screen.getByText('To change or cancel your plan please contact')
        ).toBeInTheDocument()
      })
    })
  })
})
