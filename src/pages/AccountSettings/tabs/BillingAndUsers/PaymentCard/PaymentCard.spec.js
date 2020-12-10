import { render, screen } from '@testing-library/react'

import PaymentCard from './PaymentCard'

const subscriptionDetail = {
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

describe('PaymentCard', () => {
  let wrapper

  function setup(subscriptionDetail) {
    wrapper = render(<PaymentCard subscriptionDetail={subscriptionDetail} />)
  }

  describe('when the user doesnt have any subscriptionDetail', () => {
    beforeEach(() => {
      setup(null)
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })
  describe('when the user doesnt have any cards', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        defaultPaymentMethod: null,
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user have a card', () => {
    beforeEach(() => {
      setup(subscriptionDetail)
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

  describe('when the subscription is set to expire', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        cancelAtPeriodEnd: true,
      })
    })

    it('renders the next billing', () => {
      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })
})
