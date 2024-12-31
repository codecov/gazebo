import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

import EmailAddress from './EmailAddress'
import PaymentMethod from './PaymentMethod'
import Button from 'ui/Button'
import { useState } from 'react'
import A from 'ui/A'
import EditablePaymentMethod from './EditablePaymentMethod'

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

  const isAdmin = true // TODO

  if (!subscriptionDetail) {
    return null
  }

  console.log('iseditmode', isEditMode)

  return (
    <div className="flex flex-col border">
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
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
            disabled={!isAdmin}
          >
            Edit payment
          </Button>
        ) : (
          <Button
            hook="button"
            onClick={() => setEditMode(false)}
            variant="danger"
            disabled={!isAdmin}
          >
            Cancel edit
          </Button>
        )}
      </div>
      {isEditMode ? (
        <EditablePaymentMethod />
      ) : (
        <>
          <EmailAddress />
          <PaymentMethod
            heading="Primary Payment Method"
            isPrimary={true}
            isEditMode={isEditMode}
            setEditMode={setEditMode}
            subscriptionDetail={subscriptionDetail}
            provider={provider}
            owner={owner}
          />
          <PaymentMethod
            heading="Secondary Payment Method"
            isPrimary={false}
            isEditMode={isEditMode}
            setEditMode={setEditMode}
            subscriptionDetail={subscriptionDetail}
            provider={provider}
            owner={owner}
          />
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
