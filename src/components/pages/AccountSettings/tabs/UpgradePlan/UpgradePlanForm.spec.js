import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import UpgradePlanForm from './UpgradePlanForm'

const freePlan = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 5,
}

const proPlanMonth = {
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
  quantity: 12,
}

const proPlanYear = {
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
  quantity: 17,
}

describe('UpgradePlanForm', () => {
  let props

  const defaultProps = {
    owner: 'codecov',
    provider: 'gh',
    proPlanMonth,
    proPlanYear,
    accountDetails: {
      activatedUserCount: 9,
      inactiveUserCount: 0,
      plan: null,
      latestInvoice: null,
    },
  }

  function setup(selectedPlan = null, invoice = null) {
    props = {
      ...defaultProps,
      accountDetails: {
        ...defaultProps.accountDetails,
        plan: selectedPlan,
        latestInvoice: invoice,
      },
    }
    render(<UpgradePlanForm {...props} />)
  }

  describe('when the user doesnt have any plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'users-pr-inappy'
      )
    })

    it('renders the seat input with 6 seats', () => {
      expect(screen.getByRole('spinbutton').value).toBe('6')
    })
  })

  describe('when the user have a free plan', () => {
    beforeEach(() => {
      setup(freePlan)
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'users-pr-inappy'
      )
    })

    it('renders the seat input with 6 seats', () => {
      expect(screen.getByRole('spinbutton').value).toBe('6')
    })
  })

  describe('when the user have a pro year plan', () => {
    beforeEach(() => {
      setup(proPlanYear)
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'users-pr-inappy'
      )
    })

    it('renders the seat input with 17 seats (existing subscription)', () => {
      expect(screen.getByRole('spinbutton').value).toBe('17')
    })

    it('has the pricing information of the month price and discount', () => {
      const price = screen.getByText(/\$2,448/)
      expect(price).toBeInTheDocument()
    })

    it('has the price for the year', () => {
      const price = screen.getByText(/\$2,040/)
      expect(price).toBeInTheDocument()
    })

    describe('when updating to a year plan', () => {
      beforeEach(() => {
        userEvent.click(screen.getAllByRole('button')[0])
        userEvent.click(screen.getAllByRole('option')[1])
      })

      it('has the price for the month', () => {
        const price = screen.getByText(/\$204/)
        expect(price).toBeInTheDocument()
      })
    })
  })

  describe('if there is an invoice', () => {
    beforeEach(() => {
      const invoice = {
        periodStart: 1595270468,
        periodEnd: 1597948868,
        dueDate: '1600544863',
        amountPaid: 9600.0,
        amountDue: 9600.0,
        amountRemaining: 0.0,
        total: 9600.0,
        subtotal: 9600.0,
        invoicePdf:
          'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
      }
      setup(proPlanMonth, invoice)
    })

    it('renders the next billing period', () => {
      expect(screen.getByText(/Next Billing Date/)).toBeInTheDocument()
      expect(screen.getByText(/August 20th, 2020/)).toBeInTheDocument()
    })
  })
})
