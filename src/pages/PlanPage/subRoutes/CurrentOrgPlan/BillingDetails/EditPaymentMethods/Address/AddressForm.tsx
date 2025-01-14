import { AddressElement, useElements } from '@stripe/react-stripe-js'
import cs from 'classnames'
import { z } from 'zod'

import { AddressSchema } from 'services/account'
import { useUpdateBillingAddress } from 'services/account/useUpdateBillingAddress'
import Button from 'ui/Button'

interface AddressFormProps {
  address?: z.infer<typeof AddressSchema>
  name?: string | null | undefined
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

  const {
    mutate: updateAddress,
    isLoading,
    error,
    reset,
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

  const showError = error && !reset

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
          <p className="mt-1 text-ds-primary-red">{showError && error}</p>
        </div>
        <div className="flex gap-1">
          <Button
            hook="submit-address-update"
            type="submit"
            variant="primary"
            disabled={isLoading}
            to={undefined}
          >
            Save
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

export default AddressForm
