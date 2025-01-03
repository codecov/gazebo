import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import Button from 'ui/Button'
import { ExpandableSection } from 'ui/ExpandableSection'

import AddressCard from '../Address/AddressCard'
import PaymentCard from '../PaymentCard'

function PaymentMethod({
  heading,
  isPrimary,
  isEditMode,
  setEditMode,
  subscriptionDetail,
  provider,
  owner,
}: {
  heading: string
  isPrimary?: boolean
  isEditMode: boolean
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
}) {
  const isAdmin = true // TODO
  const isCreditCard = subscriptionDetail?.defaultPaymentMethod?.card // TODO

  return (
    <div>
      <ExpandableSection className="m-0 border-0" defaultOpen={isPrimary}>
        <ExpandableSection.Trigger className="p-4">
          <h3 className="font-semibold">{heading}</h3>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content className="border-0 pt-0 text-xs">
          <div className="pb-4 pl-4 pt-2">
            {!isPrimary ? (
              <p className="mb-6 text-ds-gray-quaternary">
                By default, if the primary payment fails, the secondary will be
                charged automatically.
              </p>
            ) : null}
            <div className="flex">
              {/* Payment method summary */}
              <PaymentCard
                className="w-2/5 flex-1"
                isEditMode={isEditMode}
                setEditMode={setEditMode}
                subscriptionDetail={subscriptionDetail}
                provider={provider}
                owner={owner}
              />
              {/* Cardholder name */}
              <div className="mx-4 w-1/5 border-x border-ds-gray-tertiary px-4">
                <h4 className="mb-2 font-semibold">
                  {isCreditCard ? 'Cardholder name' : 'Full name'}
                </h4>
                <p>N/A</p>
              </div>
              {/* Address */}
              <AddressCard
                className="flex-1"
                isEditMode={isEditMode}
                setEditMode={setEditMode}
                subscriptionDetail={subscriptionDetail}
                provider={provider}
                owner={owner}
              />
            </div>
            {!isPrimary ? (
              <Button
                hook="button"
                disabled={!isAdmin}
                onClick={() => setEditMode(true)}
                className="mt-4"
              >
                Set as primary
              </Button>
            ) : null}
          </div>
        </ExpandableSection.Content>
      </ExpandableSection>
    </div>
  )
}

export default PaymentMethod
