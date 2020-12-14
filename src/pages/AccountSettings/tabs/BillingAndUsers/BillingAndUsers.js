import PropType from 'prop-types'

import Message from 'ui/Message'
import { useAccountDetails } from 'services/account'

import InfoMessageCancellation from './InfoMessageCancellation'
import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'
import UserManagement from './UserManagement'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  if (!accountDetails?.plan) {
    return (
      <Message variant="warning">
        <h2 className="text-lg">
          You are using a Legacy Plan Your current plan is part of our legacy
          per repository billing subscription.
        </h2>
        <p className="text-sm">
          These plans have been removed in favor of per user billing. Your
          current plan will remain in effect unless changed by you.
        </p>
      </Message>
    )
  }

  return (
    <>
      <InfoMessageCancellation
        subscriptionDetail={accountDetails.subscriptionDetail}
      />
      <div className="col-start-1 col-end-5">
        <CurrentPlanCard accountDetails={accountDetails} />
        <PaymentCard
          subscriptionDetail={accountDetails.subscriptionDetail}
          provider={provider}
          owner={owner}
        />
        <LatestInvoiceCard
          invoice={accountDetails.subscriptionDetail?.latestInvoice}
        />
      </div>
      <div className="col-start-5 col-end-13">
        <UserManagement />
      </div>
    </>
  )
}

BillingAndUsers.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default BillingAndUsers
