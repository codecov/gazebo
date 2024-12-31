import { useState } from 'react'
import { z } from 'zod'

import {
  BillingDetailsSchema,
  SubscriptionDetailSchema,
} from 'services/account'
import A from 'ui/A'
import Button from 'ui/Button'
import Icon from 'ui/Icon'

import AddressForm from './AddressForm'
import { cn } from 'shared/utils/cn'

interface AddressCardProps {
  isEditMode: boolean
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
  className?: string
}

function AddressCard({
  isEditMode,
  setEditMode,
  subscriptionDetail,
  provider,
  owner,
  className,
}: AddressCardProps) {
  const billingDetails =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails

  const isAddressSameAsPrimary = true // TODO

  return (
    <div className={cn('flex gap-2', className)}>
      {isEditMode && (
        <AddressForm
          name={billingDetails?.name || ''}
          address={billingDetails?.address}
          provider={provider}
          owner={owner}
          closeForm={() => setEditMode(false)}
        />
      )}
      {!isEditMode && (
        <>
          <BillingInner
            billingDetails={billingDetails}
            setEditMode={setEditMode}
            isAddressSameAsPrimary={isAddressSameAsPrimary}
          />
        </>
      )}
    </div>
  )
}

interface BillingInnerProps {
  billingDetails?: z.infer<typeof BillingDetailsSchema>
  setEditMode: (val: boolean) => void
  isAddressSameAsPrimary: boolean
}

function BillingInner({
  billingDetails,
  setEditMode,
  isAddressSameAsPrimary,
}: BillingInnerProps) {
  if (billingDetails) {
    return (
      <div>
        <h4 className="mb-2 font-semibold">Billing address</h4>
        {isAddressSameAsPrimary ? (
          <p>Same as primary address</p>
        ) : (
          <>
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
          </>
        )}
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
          onClick={() => setEditMode(true)}
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
