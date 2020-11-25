import PropType from 'prop-types'

import Card from 'components/Card'
import { useAccountDetails } from 'services/account'

import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-start-1 col-end-4">
        <CurrentPlanCard accountDetails={accountDetails} />
        <Card className="mt-4">Credit card information</Card>
        <div className="mt-4">
          <LatestInvoiceCard invoice={accountDetails.latestInvoice} />
        </div>
      </div>
      <div className="col-start-4 col-end-13">
        <Card>Users</Card>
      </div>
    </div>
  )
}

BillingAndUsers.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default BillingAndUsers
