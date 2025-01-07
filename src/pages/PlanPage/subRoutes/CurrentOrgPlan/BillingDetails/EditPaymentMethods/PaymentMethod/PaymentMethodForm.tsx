import { PaymentElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { useState } from 'react'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { useStripeSetupIntent } from 'services/account/useStripeSetupIntent'
import { useUpdatePaymentMethod } from 'services/account/useUpdatePaymentMethod'
import Button from 'ui/Button'

interface PaymentMethodFormProps {
  closeForm: () => void
  provider: string
  owner: string
  existingSubscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
}

const PaymentMethodForm = ({
  closeForm,
  provider,
  owner,
  existingSubscriptionDetail,
}: PaymentMethodFormProps) => {
  const [errorState, _] = useState('')
  const { data: setupIntent } = useStripeSetupIntent({ owner, provider })
  const elements = useElements()

  elements?.update({
    clientSecret: setupIntent?.clientSecret,
  })

  const {
    mutate: updatePaymentMethod,
    isLoading,
    error,
    reset,
  } = useUpdatePaymentMethod({
    provider,
    owner,
    email:
      existingSubscriptionDetail?.defaultPaymentMethod?.billingDetails?.email,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!elements) {
      return null
    }

    const paymentElement = elements.getElement(PaymentElement)

    updatePaymentMethod(paymentElement, {
      onSuccess: closeForm,
    })
  }

  const showError = (error && !reset) || errorState

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-3')}>
        <div className="mt-2 flex flex-col gap-2">
          <PaymentElement
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
              hook="update-payment"
              type="submit"
              variant="primary"
              disabled={isLoading}
              to={undefined}
            >
              Save
            </Button>
            <Button
              type="button"
              hook="cancel-payment"
              variant="plain"
              disabled={isLoading}
              onClick={closeForm}
              to={undefined}
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
