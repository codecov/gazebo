import PropType from 'prop-types'

import { useAccountDetails } from 'services/account'

import InfoMessageStripeCallback from './InfoMessageStripeCallback'
import InfoMessageCancellation from './InfoMessageCancellation'
import CurrentPlanCard from './CurrentPlanCard'
import LatestInvoiceCard from './LatestInvoiceCard'
import PaymentCard from './PaymentCard'
import UserManagement from './UserManagement'
import LegacyUser from './LegacyUser'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const shouldRenderBillingDetails = [
    accountDetails.planProvider !== 'github',
    !accountDetails.rootOrganization,
  ].every(Boolean)

  return (
    <>
      <InfoMessageCancellation
        subscriptionDetail={accountDetails.subscriptionDetail}
      />
      <InfoMessageStripeCallback />
      <div className="grid gap-0 md:gap-4 grid-cols-1 lg:grid-cols-3 max-w-6xl">
        {accountDetails.plan ? (
          <>
            <div>
              <CurrentPlanCard accountDetails={accountDetails} />
              {shouldRenderBillingDetails && (
                <>
                  <PaymentCard
                    subscriptionDetail={accountDetails.subscriptionDetail}
                    provider={provider}
                    owner={owner}
                  />
                  <LatestInvoiceCard
                    provider={provider}
                    owner={owner}
                    invoice={accountDetails.subscriptionDetail?.latestInvoice}
                  />
                </>
              )}
            </div>
            <UserManagement provider={provider} owner={owner} />
          </>
        ) : (
          <LegacyUser
            accountDetails={accountDetails}
            provider={provider}
            owner={owner}
          />
        )}
      </div>
    </>
  )
}

BillingAndUsers.propTypes = {
  provider: PropType.string.isRequired,
  owner: PropType.string.isRequired,
}

export default BillingAndUsers
