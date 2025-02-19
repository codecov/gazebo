import { PaymentElement, useElements } from '@stripe/react-stripe-js'
import { StripePaymentElement } from '@stripe/stripe-js'
import cs from 'classnames'
import { z } from 'zod'

import {
  AccountDetailsSchema,
  BillingDetailsSchema,
} from 'services/account/useAccountDetails'
import {
  MissingAddressError,
  MissingEmailError,
  MissingNameError,
  useUpdatePaymentMethod,
} from 'services/account/useUpdatePaymentMethod'
import { Provider } from 'shared/api/helpers'
import A from 'ui/A'
import Button from 'ui/Button'

interface PaymentMethodFormProps {
  closeForm: () => void
  provider: Provider
  owner: string
  accountDetails: z.infer<typeof AccountDetailsSchema>
}

const PaymentMethodForm = ({
  closeForm,
  provider,
  owner,
  accountDetails,
}: PaymentMethodFormProps) => {
  const elements = useElements()
  const subscriptionDetail = accountDetails?.subscriptionDetail

  const billingDetails =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails

  const email = getEmail(accountDetails)
  const name = getName(accountDetails)

  const {
    mutate: updatePaymentMethod,
    isLoading,
    error,
    reset,
  } = useUpdatePaymentMethod({
    provider,
    owner,
    name,
    email,
    address: stripeAddress(billingDetails) || undefined,
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

  const showError = error && !reset

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
            {showError ? getErrorMessage(error) : null}
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

export const stripeAddress = (
  billingDetails: z.infer<typeof BillingDetailsSchema> | null | undefined
) => {
  const address = billingDetails?.address
  if (!address) return undefined

  return {
    line1: address.line1 || null,
    line2: address.line2 || null,
    city: address.city || null,
    state: address.state || null,
    // eslint-disable-next-line camelcase
    postal_code: address.postalCode || null,
    country: address.country || null,
  }
}

export const getEmail = (
  accountDetails: z.infer<typeof AccountDetailsSchema>
) => {
  return (
    accountDetails?.subscriptionDetail?.defaultPaymentMethod?.billingDetails
      ?.email ||
    accountDetails?.subscriptionDetail?.latestInvoice?.customerEmail ||
    accountDetails?.subscriptionDetail?.customer?.email ||
    accountDetails?.email ||
    undefined
  )
}

export const getName = (
  accountDetails: z.infer<typeof AccountDetailsSchema>
) => {
  return (
    accountDetails?.subscriptionDetail?.defaultPaymentMethod?.billingDetails
      ?.name ||
    accountDetails?.subscriptionDetail?.latestInvoice?.customerName ||
    accountDetails?.name ||
    undefined
  )
}

export const getErrorMessage = (error: Error): JSX.Element => {
  switch (error.message) {
    case MissingNameError:
      return <span>Missing name, please edit Full Name</span>
    case MissingEmailError:
      return <span>Missing email, please edit Email</span>
    case MissingAddressError:
      return <span>Missing address, please edit Address</span>
    default:
      return (
        <span>
          There&apos;s been an error. Please try refreshing your browser, if
          this error persists please{' '}
          {/* @ts-expect-error ignore until we can convert A component to ts */}
          <A to={{ pageName: 'support' }} variant="link">
            contact support
          </A>
          .
        </span>
      )
  }
}

export default PaymentMethodForm
