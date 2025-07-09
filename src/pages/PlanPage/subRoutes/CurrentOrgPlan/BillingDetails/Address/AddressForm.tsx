import { AddressElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { z } from 'zod'

import { AddressSchema } from 'services/account/useAccountDetails'
import {
  BillingApiError,
  useUpdateBillingAddress,
} from 'services/account/useUpdateBillingAddress'
import { Theme, useThemeContext } from 'shared/ThemeContext'
import Button from 'ui/Button'

interface AddressFormProps {
  address?: z.infer<typeof AddressSchema>
  name?: string
  closeForm: () => void
  provider: string
  owner: string
}

function AddressForm({
  address,
  name,
  closeForm,
  provider,
  owner,
}: AddressFormProps) {
  const elements = useElements()
  const { theme } = useThemeContext()
  const isDarkMode = theme === Theme.DARK

  // Note: unfortunately seems Stripe doesn't let us reference like `var(--<var name>)` so rgbs are hardcoded in below
  elements?.update({
    appearance: {
      variables: {
        fontFamily: 'Poppins, ui-sans-serif, system-ui, sans-serif',
      },
      rules: {
        '.Label': {
          fontWeight: '600',
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
        '.Input': {
          backgroundColor: isDarkMode ? 'rgb(22,24,29)' : 'rgb(255,255,255)', // Same values as --color-app-container.
          borderColor: isDarkMode ? 'rgb(47,51,60)' : 'rgb(216,220,226)', // Same values as --color-ds-gray-tertiary.
          color: isDarkMode ? 'rgb(210,212,215)' : 'rgb(14,27,41)', // Same values as --color-app-text-primary.
        },
      },
    },
  })

  const {
    mutate: updateAddress,
    isLoading,
    error,
  } = useUpdateBillingAddress({
    provider,
    owner,
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (!elements) {
      return null
    }

    const newAddressObj = await elements.getElement('address')?.getValue()

    if (newAddressObj?.complete) {
      updateAddress(newAddressObj.value, { onSuccess: closeForm })
    }
  }

  return (
    <form onSubmit={submit} aria-label="form">
      <div className={cs('flex flex-col gap-3')}>
        <div className="mt-2 flex flex-col gap-2">
          <AddressElement
            options={{
              mode: 'billing',
              autocomplete: { mode: 'automatic' },
              fields: { phone: 'never' },
              defaultValues: {
                name: name,
                address: {
                  line1: address?.line1,
                  line2: address?.line2,
                  city: address?.city,
                  state: address?.state,
                  // eslint-disable-next-line camelcase
                  postal_code: address?.postalCode,
                  country: address?.country || '',
                },
              },
            }}
          />
          <p className="mt-1 text-ds-primary-red">
            {error && getErrorMessage(error)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            hook="submit-address-update"
            type="submit"
            variant="primary"
            disabled={isLoading}
            to={undefined}
          >
            Update
          </Button>
          <Button
            type="button"
            hook="cancel-address-update"
            variant="plain"
            disabled={isLoading}
            onClick={closeForm}
            to={undefined}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

export const getErrorMessage = (
  error: Error | BillingApiError
): string | undefined => {
  if (!error) return undefined

  if (error instanceof Error) {
    if (error.message) {
      return `Could not save billing address: ${error.message}`
    }
    return 'Could not save billing address. Please contact support for assistance.'
  }

  if (error.data?.detail) {
    return `Could not save billing address: ${error.data.detail}`
  }

  return 'Could not save billing address due to an unknown error. Please contact support for assistance.'
}

export default AddressForm
