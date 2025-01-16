import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'
import Button from 'ui/Button'
import { ExpandableSection } from 'ui/ExpandableSection'

import Address from './Address/Address'
import PaymentMethod from './PaymentMethod/PaymentMethod'

function ViewPaymentMethod({
  heading,
  isPrimaryPaymentMethod,
  setEditMode,
  subscriptionDetail,
  provider,
  owner,
}: {
  heading: string
  isPrimaryPaymentMethod?: boolean
  setEditMode: (isEditMode: boolean) => void
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
  provider: string
  owner: string
}) {
  const isCreditCard = subscriptionDetail?.defaultPaymentMethod?.card

  return (
    <div>
      <ExpandableSection
        className="m-0 border-0"
        defaultOpen={isPrimaryPaymentMethod}
      >
        <ExpandableSection.Trigger className="p-4">
          <h3 className="font-semibold">{heading}</h3>
        </ExpandableSection.Trigger>
        <ExpandableSection.Content className="border-0 pt-0 text-xs">
          <div className="pb-4 pl-4 pt-2">
            {!isPrimaryPaymentMethod ? (
              <p className="mb-6 text-ds-gray-quaternary">
                By default, if the primary payment fails, the secondary will be
                charged automatically.
              </p>
            ) : null}
            <div className="flex">
              {/* Payment method summary */}
              <PaymentMethod
                className="w-2/5 flex-1"
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
                <p>
                  {
                    subscriptionDetail?.defaultPaymentMethod?.billingDetails
                      ?.name
                  }
                </p>
              </div>
              {/* Address */}
              <Address
                className="flex-1"
                setEditMode={setEditMode}
                subscriptionDetail={subscriptionDetail}
                provider={provider}
                owner={owner}
              />
            </div>
            {!isPrimaryPaymentMethod ? (
              <Button
                hook="button"
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

export default ViewPaymentMethod
