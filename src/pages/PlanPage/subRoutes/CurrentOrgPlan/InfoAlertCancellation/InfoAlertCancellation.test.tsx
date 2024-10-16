import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'

import InfoAlertCancellation from './InfoAlertCancellation'

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

describe('InfoAlertCancellation', () => {
  describe('when the subscription isnt cancelled', () => {
    const subDetail = {
      ...subscriptionDetail,
      cancelAtPeriodEnd: false,
    } as z.infer<typeof SubscriptionDetailSchema>

    it('doesnt render anything', () => {
      const { container } = render(
        <InfoAlertCancellation
          subscriptionDetail={subDetail}
          // @ts-expect-error
          provider="gh"
          owner="codecov"
        />
      )
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the subscription is cancelled and will take effect at the end of the period', () => {
    const subDetail = {
      ...subscriptionDetail,
      cancelAtPeriodEnd: true,
    } as z.infer<typeof SubscriptionDetailSchema>

    it('renders a message that your subscription is cancelling', () => {
      render(
        <InfoAlertCancellation
          subscriptionDetail={subDetail}
          // @ts-expect-error
          provider="gh"
          owner="codecov"
        />
      )
      expect(screen.getByText(/Cancellation confirmation/)).toBeInTheDocument()
      expect(
        screen.getByText(/Your account will return to the/)
      ).toBeInTheDocument()
    })
  })

  describe('when the subscription is cancelled and refunded taking account immediately', () => {
    it('renders a message that your subscription is cancelled and refunded', () => {
      render(
        <InfoAlertCancellation
          // @ts-expect-error
          provider="gh"
          owner="codecov"
        />
      )
      expect(screen.getByText(/Cancellation confirmation/)).toBeInTheDocument()
      expect(
        screen.getByText(
          /An auto refund has been processed and will be credited to your account shortly./
        )
      ).toBeInTheDocument()
    })
  })
})
