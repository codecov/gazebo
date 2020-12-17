import PropType from 'prop-types'
import isNil from 'lodash/isNil'

import { useAccountDetails } from 'services/account'

import InfoMessageCancellation from './InfoMessageCancellation'
import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'
import UserManagement from './UserManagement'
import LegacyUpgrade from './LegacyUpgrade'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  if (isNil(accountDetails)) {
    return <LegacyUpgrade />
  }

  return (
    <>
      <InfoMessageCancellation
        subscriptionDetail={accountDetails.subscriptionDetail}
      />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 max-w-6xl">
        <div className="col-span-1">
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
        <UserManagement provider={provider} owner={owner} />
      </div>
    </>
  )
}

BillingAndUsers.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default BillingAndUsers
