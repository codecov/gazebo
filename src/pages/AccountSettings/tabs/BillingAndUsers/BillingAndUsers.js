import PropType from 'prop-types'

import { useAccountDetails } from 'services/account'

import InfoMessageCancellation from './InfoMessageCancellation'
import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'
import UserManagement from './UserManagement'
import LegacyUpgrade from './LegacyUpgrade'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  if (!typeof yourVariable === 'object') {
    return <LegacyUpgrade />
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
