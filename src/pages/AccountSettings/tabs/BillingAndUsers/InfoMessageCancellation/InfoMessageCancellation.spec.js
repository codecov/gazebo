import { render, screen } from '@testing-library/react'

import InfoMessageCancellation from './InfoMessageCancellation'

const subscriptionDetail = {
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: true,
}

describe('InfoMessageCancellation', () => {
  let wrapper
  function setup(subscriptionDetail) {
    wrapper = render(
      <InfoMessageCancellation
        subscriptionDetail={subscriptionDetail}
        provider="gh"
        owner="codecov"
      />
    )
  }

  describe('when the subscription isnt cancelled', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        cancelAtPeriodEnd: false,
      })
    })

    it('doesnt render anything', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the subscription is cancelled', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        cancelAtPeriodEnd: true,
      })
    })

    it('renders a message that your subscription is cancelling', () => {
      expect(
        screen.getByText(/Subscription Pending Cancellation/)
      ).toBeInTheDocument()
    })
  })
})
