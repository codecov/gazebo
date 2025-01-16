import React, { useState } from 'react'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account/useAccountDetails'

import AddressForm from './Address/AddressForm'
import PaymentMethodForm from './PaymentMethod/PaymentMethodForm'

import { SECONDARY_PAYMENT_FEATURE_ENABLED } from '../BillingDetails'

interface EditPaymentMethodsProps {
  setEditMode: (isEditMode: boolean) => void
  provider: string
  owner: string
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
}

const EditPaymentMethods = ({
  setEditMode,
  provider,
  owner,
  subscriptionDetail,
}: EditPaymentMethodsProps) => {
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary')

  const secondaryPaymentMethodFeatureEnabled = SECONDARY_PAYMENT_FEATURE_ENABLED

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-semibold">Edit payment method</h3>
      <div>
        {/* Tabs for Primary and Secondary Payment Methods */}
        <div className="ml-2 flex border-b border-ds-gray-tertiary">
          {[
            'primary',
            ...(secondaryPaymentMethodFeatureEnabled ? ['secondary'] : []),
          ].map((tab) => (
            <button
              key={tab}
              className={`py-2 ${tab === 'primary' ? 'mr-4' : ''} ${
                activeTab === tab
                  ? 'border-b-2 border-ds-gray-octonary font-semibold text-ds-gray-octonary'
                  : 'text-ds-gray-quinary hover:border-b-2 hover:border-ds-gray-quinary'
              }`}
              onClick={() => setActiveTab(tab as 'primary' | 'secondary')}
            >
              {tab === 'primary' ? 'Primary' : 'Secondary'} Payment Method
            </button>
          ))}
        </div>

        {/* Payment Details for the selected tab */}
        <div className="m-4">
          {activeTab === 'primary' && (
            <div>
              <PaymentMethodForm
                closeForm={() => setEditMode(false)}
                provider={provider}
                owner={owner}
                subscriptionDetail={subscriptionDetail}
              />
              <AddressForm
                address={
                  subscriptionDetail?.defaultPaymentMethod?.billingDetails
                    ?.address
                }
                name={
                  subscriptionDetail?.defaultPaymentMethod?.billingDetails
                    ?.name || undefined
                }
                closeForm={() => setEditMode(false)}
                provider={provider}
                owner={owner}
              />
            </div>
          )}
          {activeTab === 'secondary' && (
            <div>
              <PaymentMethodForm
                closeForm={() => setEditMode(false)}
                provider={provider}
                owner={owner}
                subscriptionDetail={subscriptionDetail}
              />
              <AddressForm
                closeForm={() => setEditMode(false)}
                provider={provider}
                owner={owner}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditPaymentMethods
