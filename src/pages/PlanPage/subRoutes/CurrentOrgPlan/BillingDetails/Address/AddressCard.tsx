import { useState } from 'react'
import { z } from 'zod'

import {
  BillingDetailsSchema,
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
  const billingDetails =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails

  return (
    <div className="flex flex-col gap-2 border-t p-4">
      {isFormOpen && (
        <AddressForm
          name={billingDetails?.name || ''}
          address={billingDetails?.address}
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
            billingDetails={billingDetails}
            setIsFormOpen={setIsFormOpen}
          />
        </>
      )}
    </div>
  )
}

interface BillingInnerProps {
  billingDetails?: z.infer<typeof BillingDetailsSchema>
  setIsFormOpen: (val: boolean) => void
}

function BillingInner({ billingDetails, setIsFormOpen }: BillingInnerProps) {
  if (billingDetails) {
    return (
      <div>
        <p>{`${billingDetails.name ?? 'N/A'}`}</p>
        <br />
        <h4 className="mb-2 font-semibold">Billing address</h4>
        <p>{`${billingDetails.address?.line1 ?? ''} ${
          billingDetails.address?.line2 ?? ''
        }`}</p>
        <p>
          {billingDetails.address?.city
            ? `${billingDetails.address?.city}, `
            : ''}
          {`${billingDetails.address?.state ?? ''} ${
            billingDetails.address?.postalCode ?? ''
          }`}
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
