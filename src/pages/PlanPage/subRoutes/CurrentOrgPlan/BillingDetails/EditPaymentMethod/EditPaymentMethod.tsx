import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React, { useState } from 'react'

import Button from 'ui/Button'

import AddressForm from '../Address/AddressForm'

// TODO - fetch from API
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || ''
const MANUALLY_FETCHED_CLIENT_SECRET = process.env.STRIPE_CLIENT_SECRET || ''

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

interface PaymentFormProps {
  clientSecret: string
}

const PaymentForm: React.FC<PaymentFormProps> = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please try again.')
      setIsSubmitting(false)
      return
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // eslint-disable-next-line camelcase
        return_url: 'https://codecov.io',
      },
    })

    if (error) {
      setErrorMessage(error.message || 'An unexpected error occurred.')
      setIsSubmitting(false)
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              name: 'John Doe',
            },
          },
        }}
      />
      <div className="mb-8 mt-4 flex gap-1">
        <Button
          hook="submit-address-update"
          type="submit"
          variant="primary"
          disabled={isSubmitting} // TODO - handle
          onClick={handleSubmit}
          to={undefined}
        >
          Save
        </Button>
        <Button
          type="button"
          hook="cancel-address-update"
          variant="plain"
          // disabled={isLoading}
          onClick={() => console.log('TODO - implement me')} // TODO - implement me
          to={undefined}
        >
          Cancel
        </Button>
      </div>

      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </div>
  )
}

const PaymentPage: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm clientSecret={clientSecret} />
    </Elements>
  )
}

interface EditablePaymentMethodProps {
  clientSecret: string
}

const EditPaymentMethod: React.FC<EditablePaymentMethodProps> = () => {
  const clientSecret = MANUALLY_FETCHED_CLIENT_SECRET // TODO - fetch from API

  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary')

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-semibold">Edit payment method</h3>
      <div>
        {/* Tabs for Primary and Secondary Payment Methods */}
        <div className="ml-2 flex border-b border-ds-gray-tertiary">
          {['primary', 'secondary'].map((tab) => (
            <button
              key={tab}
              className={`py-2 ${tab === 'primary' ? 'mr-4' : ''} ${
                activeTab === tab
                  ? 'border-b-2 border-ds-gray-octonary font-semibold text-ds-gray-octonary'
                  : 'text-ds-gray-quinary hover:border-b-2 hover:border-ds-gray-quinary'
              }`}
              onClick={() => setActiveTab(tab as 'primary' | 'secondary')}
            >
              {tab === 'primary' ? 'Primary' : 'Secondary'} Payment Method
            </button>
          ))}
        </div>

        {/* Payment Details for the selected tab */}
        <div className="m-4">
          {activeTab === 'primary' && (
            <div>
              <PaymentPage clientSecret={clientSecret} />
              <AddressForm closeForm={() => {}} provider={''} owner={''} />
            </div>
          )}
          {activeTab === 'secondary' && (
            <div>
              <PaymentPage clientSecret={clientSecret} />
              <AddressForm closeForm={() => {}} provider={''} owner={''} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditPaymentMethod
