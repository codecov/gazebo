import { render, screen } from '@testing-library/react'

import PaymentCard from './PaymentCard'

const accountDetails = {
  plan: null,
  activatedUserCount: 2,
  inactiveUserCount: 1,
  paymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  latestInvoice: {
    periodStart: 1606851492,
    dueDate: '1609443492',
    periodEnd: 1606851492,
    total: 86407,
    invoicePdf:
      'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
  },
}

describe('PaymentCard', () => {
  let wrapper

  function setup(accountDetails) {
    wrapper = render(<PaymentCard accountDetails={accountDetails} />)
  }

  describe('when the user doesnt have any cards', () => {
    beforeEach(() => {
      setup({
        ...accountDetails,
        paymentMethod: null,
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user have a card', () => {
    beforeEach(() => {
      setup(accountDetails)
    })

    it('renders the card', () => {
      expect(screen.getByText(/Visa/)).toBeInTheDocument()
      expect(
        screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 1234/)
      ).toBeInTheDocument()
      expect(screen.getByText(/Expires 12\/2021/)).toBeInTheDocument()
    })

    it('renders the next billing', () => {
      expect(screen.getByText(/1st December, 2020/)).toBeInTheDocument()
    })
  })
})
