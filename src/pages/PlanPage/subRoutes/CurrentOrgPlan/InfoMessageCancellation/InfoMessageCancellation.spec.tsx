import { render, screen } from '@testing-library/react'
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
  describe('when the subscription isnt cancelled', () => {
    const subDetail = {
      ...subscriptionDetail,
      cancelAtPeriodEnd: false,
    } as z.infer<typeof SubscriptionDetailSchema>

    it('doesnt render anything', () => {
      const { container } = render(
        <InfoMessageCancellation
          subscriptionDetail={subDetail}
          // @ts-expect-error
          provider="gh"
          owner="codecov"
        />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the subscription is cancelled', () => {
    const subDetail = {
      ...subscriptionDetail,
      cancelAtPeriodEnd: true,
    } as z.infer<typeof SubscriptionDetailSchema>

    it('renders a message that your subscription is cancelling', () => {
      render(
        <InfoMessageCancellation
          subscriptionDetail={subDetail}
          // @ts-expect-error
          provider="gh"
          owner="codecov"
        />
      )
      expect(
        screen.getByText(/Subscription Pending Cancellation/)
      ).toBeInTheDocument()
    })
  })
})
