import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { CollectionMethods } from 'shared/utils/billing'

import CurrentPlanCard from './CurrentPlanCard'
import InfoMessageCancellation from './InfoMessageCancellation'
import InfoMessageStripeCallback from './InfoMessageStripeCallback'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'

function CurrentOrgPlan() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const shouldRenderBillingDetails = [
    accountDetails?.planProvider !== 'github',
    !accountDetails?.rootOrganization,
  ].every(Boolean)
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const collectionMethod = accountDetails?.subscriptionDetail?.collectionMethod
  const isInvoicedCustomer =
    collectionMethod === CollectionMethods.INVOICED_CUSTOMER_METHOD

  return (
    <div className="w-full lg:w-4/5">
      <InfoMessageCancellation
        subscriptionDetail={accountDetails?.subscriptionDetail}
      />
      <InfoMessageStripeCallback />
      {accountDetails?.plan && (
        <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial md:w-2/3 lg:w-3/4">
          <CurrentPlanCard
            plan={plan}
            isInvoicedCustomer={isInvoicedCustomer}
            scheduledPhase={scheduledPhase}
          />
          {shouldRenderBillingDetails && (
            <>
              <PaymentCard
                subscriptionDetail={accountDetails?.subscriptionDetail}
                provider={provider}
                owner={owner}
              />
              <LatestInvoiceCard />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CurrentOrgPlan
