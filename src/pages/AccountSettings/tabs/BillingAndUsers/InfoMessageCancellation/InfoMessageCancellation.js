import { format, fromUnixTime } from 'date-fns'

import { subscriptionDetailType } from 'services/account'
import Message from 'ui/Message'

function getPeriodEnd(subscriptionDetail) {
  const periodEnd = fromUnixTime(subscriptionDetail.currentPeriodEnd)
  return format(periodEnd, 'MMMM do yyyy, h:m aaaa')
}

function InfoMessageCancellation({ subscriptionDetail }) {
  if (!subscriptionDetail?.cancelAtPeriodEnd) return null
  const periodEnd = getPeriodEnd(subscriptionDetail)
  return (
    <div className="col-start-1 col-end-13">
      <Message variant="info">
        <h2 className="text-lg">Subscription Pending Cancellation</h2>
        <p className="text-sm">
          Your subscription has been cancelled and will become inactive on{' '}
          {periodEnd}
        </p>
      </Message>
    </div>
  )
}

InfoMessageCancellation.propTypes = {
  subscriptionDetail: subscriptionDetailType,
}

export default InfoMessageCancellation
