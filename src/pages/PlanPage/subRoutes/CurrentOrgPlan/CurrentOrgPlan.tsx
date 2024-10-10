import { useParams } from 'react-router-dom'

import { usePlanUpdatedNotification } from 'pages/PlanPage/context'
import { useAccountDetails } from 'services/account'
import { getScheduleStart } from 'shared/plan/ScheduledPlanDetails/ScheduledPlanDetails'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

import BillingDetails from './BillingDetails'
import CurrentPlanCard from './CurrentPlanCard'
import { useEnterpriseAccountDetails } from './hooks/useEnterpriseAccountDetails'
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
  const { data: enterpriseDetails } = useEnterpriseAccountDetails({
    provider,
    owner,
  })

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const isDelinquent = accountDetails?.delinquent
  const scheduleStart = scheduledPhase
    ? getScheduleStart(scheduledPhase)
    : undefined

  const shouldRenderBillingDetails =
    (accountDetails?.planProvider !== 'github' &&
      !accountDetails?.rootOrganization) ||
    accountDetails?.usesInvoice

  const planUpdatedNotification = usePlanUpdatedNotification()

  const account = enterpriseDetails?.owner?.account

  return (
    <div className="w-full lg:w-4/5">
      {accountDetails?.subscriptionDetail ? (
        <InfoMessageCancellation
          subscriptionDetail={accountDetails?.subscriptionDetail}
        />
      ) : null}
      <InfoMessageStripeCallback />
      {isDelinquent ? <DelinquentAlert /> : null}
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
          {account ? (
            <AccountUsageAlert
              totalSeats={account.totalSeatCount}
              activatedUsers={account.activatedUserCount}
            />
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

const AccountUsageAlert = ({
  totalSeats,
  activatedUsers,
}: {
  totalSeats: number
  activatedUsers: number
}) => {
  const percentUsed = activatedUsers / totalSeats
  if (percentUsed === 1) {
    return (
      <Alert variant="warning">
        <Alert.Title>Your account is using 100% of its seats</Alert.Title>
        <Alert.Description>
          You might want to add more seats for your team to ensure availability.{' '}
          {/* @ts-expect-error */}
          <A to={{ pageName: 'enterpriseSupport' }}>Contact support</A> to
          update your plan.
        </Alert.Description>
      </Alert>
    )
  } else if (percentUsed >= 0.9) {
    return (
      <Alert variant="info">
        <Alert.Title>Your account is using 90% of its seats</Alert.Title>
        <Alert.Description>
          You might want to add more seats for your team to ensure availability.{' '}
          {/* @ts-expect-error */}
          <A to={{ pageName: 'enterpriseSupport' }}>Contact support</A> to
          update your plan.
        </Alert.Description>
      </Alert>
    )
  }

  return null
}

const DelinquentAlert = () => {
  return (
    <>
      <Alert variant={'error'}>
        <Alert.Title>Your most recent payment failed</Alert.Title>
        <Alert.Description>
          Please try a different card or contact support at support@codecov.io.
        </Alert.Description>
      </Alert>
      <br />
    </>
  )
}

export default CurrentOrgPlan
