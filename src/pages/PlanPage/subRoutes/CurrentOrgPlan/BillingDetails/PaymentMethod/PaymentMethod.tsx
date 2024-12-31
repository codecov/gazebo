import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import { ExpandableSection } from 'ui/ExpandableSection'

import AddressCard from '../Address/AddressCard'
import PaymentCard from '../PaymentCard'
import Button from 'ui/Button'

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

  console.log(subscriptionDetail)

  console.log(isEditMode)
  return (
    <ExpandableSection>
      <ExpandableSection.Trigger className="p-4">
        <h3 className="font-semibold">{heading}</h3>
      </ExpandableSection.Trigger>
      <ExpandableSection.Content className="px-4 pb-4">
        {!isPrimary ? (
          <p className="pl-4 text-sm text-ds-gray-quaternary">
            By default, if the primary payment fails, the secondary will be
            charged automatically.
          </p>
        ) : null}
        <div className="flex gap-2">
          <PaymentCard
            className="flex-1"
            isEditMode={isEditMode}
            setEditMode={setEditMode}
            subscriptionDetail={subscriptionDetail}
            provider={provider}
            owner={owner}
          />
          <div className="flex-1 border-x border-ds-gray-tertiary px-4 pt-4">
            <h4 className="font-semibold">{isCreditCard ? 'Cardholder name' : 'Full name'}</h4>
            <p>N/A</p>
          </div>
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
            onClick={() => console.log('TODO - implement me')}
          >
            Set as primary
          </Button>
        ) : null}
      </ExpandableSection.Content>
    </ExpandableSection>
  )
}

export default PaymentMethod
