import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

import BillingDetails from './BillingDetails'
import CurrentPlanCard from './CurrentPlanCard'
import InfoMessageCancellation from './InfoMessageCancellation'
import InfoMessageStripeCallback from './InfoMessageStripeCallback'
import LatestInvoiceCard from './LatestInvoiceCard'

interface URLParams {
  provider: string
  owner: string
}

function CurrentOrgPlan() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })

  const shouldRenderBillingDetails = [
    accountDetails?.planProvider !== 'github',
    !accountDetails?.rootOrganization,
  ].every(Boolean)

  return (
    <div className="w-full lg:w-4/5">
      {accountDetails?.subscriptionDetail && (
        <InfoMessageCancellation
          subscriptionDetail={accountDetails?.subscriptionDetail}
        />
      )}
      <InfoMessageStripeCallback />
      {accountDetails?.plan && (
        <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial md:w-2/3 lg:w-3/4">
          <CurrentPlanCard />
          {shouldRenderBillingDetails && (
            <>
              <BillingDetails />
              <LatestInvoiceCard />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default CurrentOrgPlan
