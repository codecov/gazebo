import { useState } from 'react'
import { z } from 'zod'

import {
  AddressSchema,
  SubscriptionDetailSchema,
} from 'services/account/useAccountDetails'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import AddressForm from './AddressForm'

interface AddressCardProps {
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
}

function AddressCard({
  subscriptionDetail,
  provider,
  owner,
}: AddressCardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const address =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails?.address ||
    subscriptionDetail?.customer?.address

  const name =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails?.name ||
    subscriptionDetail?.customer?.name

  return (
    <div className="flex flex-col gap-2 border-t p-4">
      {isFormOpen && (
        <AddressForm
          name={name || ''}
          address={address}
          provider={provider}
          owner={owner}
          closeForm={() => setIsFormOpen(false)}
        />
      )}
      {!isFormOpen && (
        <>
          <div className="flex justify-between">
            <h4 className="font-semibold">Full name</h4>
            <A
              variant="semibold"
              onClick={() => setIsFormOpen(true)}
              hook="edit-address"
              isExternal={false}
              to={undefined}
            >
              Edit <Icon name="chevronRight" size="sm" variant="solid" />
            </A>
          </div>
          <BillingInner
            address={address}
            name={name}
            setIsFormOpen={setIsFormOpen}
          />
        </>
      )}
    </div>
  )
}

interface BillingInnerProps {
  address?: z.infer<typeof AddressSchema> | null
  name?: string | null
  setIsFormOpen: (val: boolean) => void
}

function BillingInner({ address, name, setIsFormOpen }: BillingInnerProps) {
  if (address) {
    return (
      <div>
        <p>{`${name ?? 'N/A'}`}</p>
        <br />
        <h4 className="mb-2 font-semibold">Billing address</h4>
        <p>{`${address?.line1 ?? ''} ${address?.line2 ?? ''}`}</p>
        <p>
          {address?.city ? `${address?.city}, ` : ''}
          {`${address?.state ?? ''} ${address?.postalCode ?? ''}`}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 text-ds-gray-quinary">
      <p className="mt-4">
        No address has been set. Please contact support if you think it’s an
        error or set it yourself.
      </p>
      <div className="flex self-start">
        <Button
          hook="open-modal"
          variant="primary"
          onClick={() => setIsFormOpen(true)}
          to={undefined}
          disabled={false}
        >
          Set address
        </Button>
      </div>
    </div>
  )
}

export default AddressCard
