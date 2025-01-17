import { PaymentElement, useElements } from '@stripe/react-stripe-js'
import { StripePaymentElement } from '@stripe/stripe-js'
import cs from 'classnames'
import { useState } from 'react'
import { z } from 'zod'

import { stripeAddress, SubscriptionDetailSchema } from 'services/account'
import { useUpdatePaymentMethod } from 'services/account/useUpdatePaymentMethod'
import { Provider } from 'shared/api/helpers'
import Button from 'ui/Button'

interface PaymentMethodFormProps {
  closeForm: () => void
  provider: Provider
  owner: string
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
}

const PaymentMethodForm = ({
  closeForm,
  provider,
  owner,
  subscriptionDetail,
}: PaymentMethodFormProps) => {
  const [errorState, setErrorState] = useState('')
  const elements = useElements()

  const {
    mutate: updatePaymentMethod,
    isLoading,
    error,
    reset,
  } = useUpdatePaymentMethod({
    provider,
    owner,
    name:
      subscriptionDetail?.defaultPaymentMethod?.billingDetails?.name ||
      undefined,
    email:
      subscriptionDetail?.defaultPaymentMethod?.billingDetails?.email ||
      undefined,
    address:
      stripeAddress(subscriptionDetail?.defaultPaymentMethod?.billingDetails) ||
      undefined,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!elements) {
      return null
    }

    elements.submit()

    const paymentElement = elements.getElement(
      PaymentElement
    ) as StripePaymentElement

    updatePaymentMethod(paymentElement, {
      onSuccess: async () => {
        closeForm()
      },
    })
  }

  const showError = (error && !reset) || errorState

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-3')}>
        <div className="mt-2 flex flex-col gap-2">
          <PaymentElement
            onChange={(e) => setErrorState(e?.value?.type || '')}
            options={{
              layout: 'tabs',
              fields: {
                billingDetails: {
                  name: 'never', // collect this from the Address form
                  email: 'never', // collect this from the Email form
                },
              },
            }}
          />
          <p className="mt-1 text-ds-primary-red">
            {showError && (error?.message || errorState)}
          </p>
          <div className="mb-8 mt-4 flex gap-1">
            <Button
              hook="save-payment-method"
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              Save
            </Button>
            <Button
              type="button"
              hook="cancel-payment"
              variant="plain"
              disabled={isLoading}
              onClick={closeForm}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PaymentMethodForm
