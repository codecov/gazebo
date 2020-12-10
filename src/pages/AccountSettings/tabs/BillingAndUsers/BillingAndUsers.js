import PropType from 'prop-types'

import Card from 'ui/Card'
import { useAccountDetails } from 'services/account'

import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  return (
    <>
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
        <Card>Users</Card>
      </div>
    </>
  )
}

BillingAndUsers.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default BillingAndUsers
