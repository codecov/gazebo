import React, { useState } from 'react'
import AddressForm from '../Address/AddressForm'
import {
  Elements,
  CardElement,
  IbanElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CreditCardForm from '../PaymentCard/CreditCardForm'
import { RadioTileGroup } from 'ui/RadioTileGroup'
import Icon from 'ui/Icon'

// Load your Stripe public key
const stripePromise = loadStripe('your-publishable-key-here')

interface PaymentFormProps {
  clientSecret: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
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

    const paymentElement = elements.getElement(
      paymentMethod === 'card' ? CardElement : IbanElement
    )

    if (!paymentElement) {
      setErrorMessage('Payment element is missing.')
      setIsSubmitting(false)
      return
    }

    // Confirm payment based on selected method
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://your-website.com/order-complete', // Redirect URL
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold">Choose Payment Method</h2>

      <RadioTileGroup
        value={paymentMethod}
        onValueChange={(value: 'card' | 'bank') => setPaymentMethod(value)}
        className="flex-row"
      >
        <RadioTileGroup.Item value="card" data-testid="card-radio">
          <RadioTileGroup.Label>
            <div className="flex items-center gap-2">
              <Icon name="checkCircle"></Icon>
              Card
            </div>
          </RadioTileGroup.Label>
        </RadioTileGroup.Item>
        <RadioTileGroup.Item value="bank" data-testid="bank-radio">
          <RadioTileGroup.Label>
            <div className="flex items-center gap-2">
              <Icon name="checkCircle"></Icon>
              Bank Account
            </div>
          </RadioTileGroup.Label>
        </RadioTileGroup.Item>
      </RadioTileGroup>

      {/* Payment Element */}
      {paymentMethod === 'card' && (
        <div>
          <h3 className="font-semibold">Card Details</h3>
          <CreditCardForm
            closeForm={function (): void {
              throw new Error('Function not implemented.')
            }}
            provider={''}
            owner={''}
          />
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div>
          <h3 className="font-semibold">Bank Account Details</h3>
          <IbanElement
            className="border p-2 rounded"
            options={{
              supportedCountries: ['SEPA'], // Specify the supported countries
            }}
          />
        </div>
      )}

      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
    </form>
  )
}

// Wrapper Component to provide Stripe Elements
const PaymentPage: React.FC<{ clientSecret: string }> = ({ clientSecret }) => {
  // if (!clientSecret) {
  //   return <div>Loading...</div>
  // }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
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

const EditPaymentMethod: React.FC<EditablePaymentMethodProps> = ({
  clientSecret,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-semibold">Edit payment method</h3>
      <PaymentPage clientSecret={clientSecret} />
      <AddressForm
        closeForm={function (): void {
          throw new Error('TODO')
        }}
        provider={''}
        owner={''}
      />
    </div>
  )
}

export default EditPaymentMethod
