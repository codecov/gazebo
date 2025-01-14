import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import A from 'ui/A'
import Button from 'ui/Button'

import EditPaymentMethods from './EditPaymentMethods'
import EmailAddress from './EmailAddress'
import { ViewPaymentMethod } from './ViewPaymentMethod'

// Remove this when we build Secondary Payment Method feature
export const SECONDARY_PAYMENT_FEATURE_ENABLED = false

interface URLParams {
  provider: string
  owner: string
}

function BillingDetails() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })
  const subscriptionDetail = accountDetails?.subscriptionDetail
  const [isEditMode, setEditMode] = useState(false)

  const secondaryPaymentFeatureEnabled = SECONDARY_PAYMENT_FEATURE_ENABLED

  if (!subscriptionDetail) {
    return null
  }

  return (
    <div className="flex flex-col divide-y border">
      {/* Billing Details Section */}
      <div className="flex items-center justify-between gap-4 p-4">
        <div>
          <h3 className="font-semibold">Billing details</h3>
          <p className="pt-1 text-xs text-ds-gray-octonary">
            You can modify your billing details. To update your tax IDs, please{' '}
            {/* @ts-expect-error ignore until we can convert A component to ts */}
            <A to={{ pageName: 'support' }} variant="link">
              contact support
            </A>
          </p>
        </div>
        {!isEditMode ? (
          <Button
            hook="button"
            onClick={() => setEditMode(true)}
            variant="default"
            className="flex-none"
          >
            Edit payment
          </Button>
        ) : (
          <Button
            hook="button"
            onClick={() => setEditMode(false)}
            variant="default"
            className="flex-none"
          >
            Back
          </Button>
        )}
      </div>
      {isEditMode ? (
        <EditPaymentMethods
          setEditMode={setEditMode}
          provider={provider}
          owner={owner}
          subscriptionDetail={subscriptionDetail}
        />
      ) : (
        <>
          <EmailAddress />
          <ViewPaymentMethod
            heading="Primary Payment Method"
            isPrimaryPaymentMethod={true}
            setEditMode={setEditMode}
            subscriptionDetail={subscriptionDetail}
            provider={provider}
            owner={owner}
          />
          {secondaryPaymentFeatureEnabled && (
            <ViewPaymentMethod
              heading="Secondary Payment Method"
              isPrimaryPaymentMethod={false}
              setEditMode={setEditMode}
              subscriptionDetail={subscriptionDetail}
              provider={provider}
              owner={owner}
            />
          )}
          {subscriptionDetail?.taxIds?.length ? (
            <div className="flex flex-col gap-2 p-4">
              <h4 className="font-semibold">Tax ID</h4>
              {subscriptionDetail?.taxIds?.map((val, index) => (
                <p key={index}>{val?.value}</p>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default BillingDetails
