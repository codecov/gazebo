import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'

import UpgradePlanPage from './UpgradePlanPage'

jest.mock('services/account')
jest.mock('./UpgradePlanForm', () => () => 'UpgradePlanForm')

describe('UpgradePlanPage', () => {
  function setup({ planValue = 'Pro Team' }) {
    useAccountDetails.mockReturnValue({
      data: {
        plan: { value: planValue },
        activatedUserCount: 2,
        inactiveUserCount: 1,
      },
    })
    usePlans.mockReturnValue({
      data: getPlans(),
    })
    render(<UpgradePlanPage />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders the basic plan title', () => {
      const title = screen.getAllByText(/Pro Team/)[0]
      expect(title).toBeInTheDocument()
    })

    it('renders a cancel plan link', () => {
      const cancelLink = screen.getByText('Cancel plan')
      expect(cancelLink).toBeInTheDocument()
    })

    it('does not render upgrade banner', () => {
      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('when rendered with free plan', () => {
    beforeEach(() => {
      setup({ planValue: 'users-basic' })
    })

    it('renders upgrade banner', () => {
      const banner = screen.getByText(/You are choosing to upgrade/)
      expect(banner).toBeInTheDocument()
    })
  })
})

function getPlans() {
  return [
    {
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
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisem',
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
      value: 'users-enterprisey',
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
