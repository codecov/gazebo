import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { usePlanUpdatedNotification } from 'pages/PlanPage/context'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { Provider } from 'shared/api/helpers'
import { getScheduleStart } from 'shared/plan/ScheduledPlanDetails/ScheduledPlanDetails'
import A from 'ui/A'
import { Alert } from 'ui/Alert'

import AccountOrgs from './AccountOrgs'
import BillingDetails from './BillingDetails'
import CurrentPlanCard from './CurrentPlanCard'
import InfoAlertCancellation from './InfoAlertCancellation'
import InfoMessageStripeCallback from './InfoMessageStripeCallback'
import LatestInvoiceCard from './LatestInvoiceCard'
import { EnterpriseAccountDetailsQueryOpts } from './queries/EnterpriseAccountDetailsQueryOpts'
import { useCurrentOrgPlanPageData } from './useCurrentOrgPlanPageData'

interface URLParams {
  provider: Provider
  owner: string
}

function CurrentOrgPlan() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
  })

  const { data } = useCurrentOrgPlanPageData({
    provider,
    owner,
  })

  const { data: enterpriseDetails } = useSuspenseQueryV5(
    EnterpriseAccountDetailsQueryOpts({
      provider,
      owner,
    })
  )

  const hasUnverifiedPaymentMethods =
    !!data?.billing?.unverifiedPaymentMethods?.length

  // awaitingInitialPaymentMethodVerification is true if the
  // customer needs to verify a delayed notification payment method
  // like ACH for their first subscription
  const awaitingInitialPaymentMethodVerification =
    !accountDetails?.subscriptionDetail?.defaultPaymentMethod &&
    hasUnverifiedPaymentMethods

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const isDelinquent =
    accountDetails?.delinquent && !awaitingInitialPaymentMethodVerification
  const scheduleStart = scheduledPhase
    ? getScheduleStart(scheduledPhase)
    : undefined

  const shouldRenderBillingDetails =
    !awaitingInitialPaymentMethodVerification &&
    ((accountDetails?.planProvider !== 'github' &&
      !accountDetails?.rootOrganization) ||
      accountDetails?.usesInvoice)

  const planUpdatedNotification = usePlanUpdatedNotification()

  const account = enterpriseDetails?.owner?.account

  return (
    <div className="w-full lg:w-4/5">
      {planUpdatedNotification.isCancellation ? (
        <InfoAlertCancellation
          subscriptionDetail={accountDetails?.subscriptionDetail}
        />
      ) : null}
      <InfoMessageStripeCallback
        awaitingInitialPaymentMethodVerification={
          awaitingInitialPaymentMethodVerification
        }
      />
      {isDelinquent ? <DelinquentAlert /> : null}
      {data?.plan ? (
        <div className="flex flex-col gap-4 sm:mr-4 sm:flex-initial md:w-2/3 lg:w-3/4">
          {planUpdatedNotification.alertOption &&
          !planUpdatedNotification.isCancellation ? (
            <Alert variant={planUpdatedNotification.alertOption}>
              {scheduleStart && scheduledPhase?.quantity ? (
                <>
                  <Alert.Title>Plan successfully updated</Alert.Title>
                  <Alert.Description>
                    The start date is {scheduleStart} with a monthly
                    subscription for {scheduledPhase.quantity} paid seats.
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
          {account ? <AccountOrgs account={account} /> : null}
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
          {/* @ts-expect-error - A hasn't been typed yet */}
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
          {/* @ts-expect-error - A hasn't been typed yet */}
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
          Please try a different payment method or contact support at
          support@codecov.io.
        </Alert.Description>
      </Alert>
      <br />
    </>
  )
}

export default CurrentOrgPlan
