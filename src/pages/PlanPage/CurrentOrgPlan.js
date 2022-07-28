import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

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

  return (
    <>
      <InfoMessageCancellation
        subscriptionDetail={accountDetails?.subscriptionDetail}
      />
      <InfoMessageStripeCallback />
      {accountDetails?.plan && (
        <div className="sm:mr-4 sm:flex-initial gap-4 flex flex-col w-2/3 lg:w-2/4">
          <CurrentPlanCard accountDetails={accountDetails} />
          {shouldRenderBillingDetails && (
            <>
              <PaymentCard
                subscriptionDetail={accountDetails?.subscriptionDetail}
                provider={provider}
                owner={owner}
              />
              <LatestInvoiceCard
                invoice={accountDetails?.subscriptionDetail?.latestInvoice}
              />
            </>
          )}
        </div>
      )}
    </>
  )
}

export default CurrentOrgPlan
