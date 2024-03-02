import { render, RenderResult, screen } from '@testing-library/react'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'

import InfoMessageCancellation from './InfoMessageCancellation'

const subscriptionDetail = {
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: true,
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2023,
      last4: '1234',
    },
  },
} as z.infer<typeof SubscriptionDetailSchema>

describe('InfoMessageCancellation', () => {
  let wrapper: RenderResult
  function setup(subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>) {
    wrapper = render(
      <InfoMessageCancellation
        subscriptionDetail={subscriptionDetail}
        // @ts-expect-error
        provider="gh"
        owner="codecov"
      />
    )
  }

  describe('when the subscription isnt cancelled', () => {
    beforeEach(() => {
      // @ts-expect-error
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
      // @ts-expect-error
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
