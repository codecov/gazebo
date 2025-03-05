import { format, fromUnixTime } from 'date-fns'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account/useAccountDetails'
import { Alert } from 'ui/Alert'

function getPeriodEnd(
  subscriptionDetail: z.infer<typeof SubscriptionDetailSchema>
) {
  const periodEnd = fromUnixTime(subscriptionDetail!.currentPeriodEnd)
  return format(periodEnd, 'MMMM do yyyy, h:mm aaaa')
}

function InfoAlertCancellation({
  subscriptionDetail,
}: {
  subscriptionDetail?: z.infer<typeof SubscriptionDetailSchema>
}) {
  let periodEnd: string | undefined
  // A scheduled subscription cancellation at period end should have subscriptionDetail with cancelAtPeriodEnd field
  // set to true. An immediately cancelled and refunded subscription will not have subscriptionDetail.
  if (subscriptionDetail) {
    if (!subscriptionDetail?.cancelAtPeriodEnd) return null
    periodEnd = getPeriodEnd(subscriptionDetail)
  }
  return (
    <div className="col-start-1 col-end-13 mb-4 sm:flex-initial md:w-2/3 lg:w-3/4">
      <Alert variant="info">
        <Alert.Title className="text-sm">Cancellation confirmation</Alert.Title>
        <Alert.Description className="text-sm">
          Your subscription has been successfully cancelled. Your account{' '}
          {subscriptionDetail ? 'will return' : 'has been returned'} to the{' '}
          <b>one-seat developer plan</b>
          {subscriptionDetail
            ? ` on ${periodEnd} Thank you for using our service.`
            : '. An auto refund has been processed and will be credited to your account shortly.'}
        </Alert.Description>
      </Alert>
    </div>
  )
}

export default InfoAlertCancellation
