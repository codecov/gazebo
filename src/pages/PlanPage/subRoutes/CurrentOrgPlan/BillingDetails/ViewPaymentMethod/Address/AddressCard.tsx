import { z } from 'zod'

import {
  BillingDetailsSchema,
  SubscriptionDetailSchema,
} from 'services/account'
import { cn } from 'shared/utils/cn'
import Button from 'ui/Button'

import { SECONDARY_PAYMENT_FEATURE_ENABLED } from '../../BillingDetails'

interface AddressCardProps {
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
  className?: string
}

function AddressCard({
  setEditMode,
  subscriptionDetail,
  className,
}: AddressCardProps) {
  const billingDetails =
    subscriptionDetail?.defaultPaymentMethod?.billingDetails

  // TODO: Implement this when we have secondary payment method feature
  const isAddressSameAsPrimary = SECONDARY_PAYMENT_FEATURE_ENABLED
    ? true
    : undefined

  return (
    <div className={cn('flex gap-2', className)}>
      <BillingInner
        billingDetails={billingDetails}
        setEditMode={setEditMode}
        isAddressSameAsPrimary={isAddressSameAsPrimary}
      />
    </div>
  )
}

interface BillingInnerProps {
  billingDetails?: z.infer<typeof BillingDetailsSchema>
  setEditMode: (val: boolean) => void
  isAddressSameAsPrimary?: boolean
}

function BillingInner({
  billingDetails,
  setEditMode,
  isAddressSameAsPrimary,
}: BillingInnerProps) {
  const isEmptyAddress =
    !billingDetails?.address?.line1 &&
    !billingDetails?.address?.line2 &&
    !billingDetails?.address?.city &&
    !billingDetails?.address?.state &&
    !billingDetails?.address?.postalCode

  if (billingDetails) {
    return (
      <div>
        <h4 className="mb-2 font-semibold">Billing address</h4>
        {isAddressSameAsPrimary ? (
          <p>Same as primary address</p>
        ) : isEmptyAddress ? (
          <p>-</p>
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
