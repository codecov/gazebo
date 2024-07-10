import { useParams } from 'react-router-dom'

import { usePlanUpdatedNotification } from 'pages/PlanPage/context'
import { useAccountDetails } from 'services/account'
import { getScheduleStart } from 'shared/plan/ScheduledPlanDetails/ScheduledPlanDetails'
import { Alert } from 'ui/Alert'

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

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const scheduleStart = scheduledPhase
    ? getScheduleStart(scheduledPhase)
    : undefined

  const shouldRenderBillingDetails =
    (accountDetails?.planProvider !== 'github' &&
      !accountDetails?.rootOrganization) ||
    accountDetails?.usesInvoice

  const planUpdatedNotification = usePlanUpdatedNotification()

  return (
    <div className="w-full lg:w-4/5">
      {accountDetails?.subscriptionDetail ? (
        <InfoMessageCancellation
          subscriptionDetail={accountDetails?.subscriptionDetail}
        />
      ) : null}
      <InfoMessageStripeCallback />
      {accountDetails?.plan ? (
        <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial md:w-2/3 lg:w-3/4">
          {planUpdatedNotification.alertOption ? (
            <Alert variant={planUpdatedNotification.alertOption}>
              {scheduleStart && scheduledPhase?.quantity ? (
                <>
                  <Alert.Title>Plan successfully updated.</Alert.Title>
                  <Alert.Description>
                    The start date is {scheduleStart} with a monthly
                    subscription for {scheduledPhase.quantity} seats.
                  </Alert.Description>
                </>
              ) : (
                <Alert.Description>
                  Plan successfully updated.
                </Alert.Description>
              )}
            </Alert>
          ) : null}
          <CurrentPlanCard />
          {shouldRenderBillingDetails ? (
            <>
              <BillingDetails />
              <LatestInvoiceCard />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default CurrentOrgPlan
