import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import CancelPlan from './CancelPlan'
import { useAccountsAndPlans } from 'services/account'

jest.mock('services/account/hooks')

const provider = 'gh'
const owner = 'codecov'

describe('CancelPlan', () => {
  function setup(url) {
    useAccountsAndPlans.mockReturnValue({
      data: {
        accountDetails: {
          plan: {
            marketingName: 'Pro Team',
            baseUnitPrice: 12,
            benefits: ['Configureable # of users', 'Unlimited repos'],
            quantity: 5,
            value: 'users-inappm',
          },
          activatedUserCount: 2,
          inactiveUserCount: 1,
        },
        plans: getPlans(),
      },
    })
    render(<CancelPlan provider={provider} owner={owner} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders the basic plan title', () => {
      const tab = screen.getByText(/Basic/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the downgrade button title', () => {
      const tab = screen.getByText(/Downgrade to Free/)
      expect(tab).toBeInTheDocument()
    })
  })
})

function getPlans() {
  return [
    {
      marketingName: 'Basic',
      value: 'users-free',
      billingRate: null,
      basUnitprice: 0,
      benefits: [
        'Up to 5 users',
        'Unlimited public repositories',
        'Unlimited private repositories',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappm',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}
