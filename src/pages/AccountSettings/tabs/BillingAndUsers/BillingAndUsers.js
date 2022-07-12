import PropType from 'prop-types'

import { useAccountDetails } from 'services/account'

import CurrentPlanCard from './CurrentPlanCard'
import InfoMessageCancellation from './InfoMessageCancellation'
import InfoMessageStripeCallback from './InfoMessageStripeCallback'
import LatestInvoiceCard from './LatestInvoiceCard'
import LegacyUser from './LegacyUser'
import PaymentCard from './PaymentCard'
import UserManagement from './UserManagement'

function BillingAndUsers({ provider, owner }) {
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const shouldRenderBillingDetails = [
    accountDetails?.planProvider !== 'github',
    !accountDetails?.rootOrganization,
  ].every(Boolean)

  return (
    <>
      {/* TODO: Will also leave these for later as I'm not sure where they'll belong */}
      <InfoMessageCancellation
        subscriptionDetail={accountDetails?.subscriptionDetail}
      />
      <InfoMessageStripeCallback />
      <div className="block md:flex flex-wrap justify-between">
        {accountDetails?.plan ? (
          <>
            {/* TODO: Look into this line below after this is migrated to the 'plan' page as UserManagement will be in its own tab */}
            <div className="sm:mr-4 sm:flex-initial flex-1 max-w-sm gap-4 flex flex-col gap-4">
              <CurrentPlanCard accountDetails={accountDetails} />
              {shouldRenderBillingDetails && (
                <>
                  <PaymentCard
                    subscriptionDetail={accountDetails?.subscriptionDetail}
                    provider={provider}
                    owner={owner}
                  />
                  <LatestInvoiceCard
                    invoice={accountDetails?.subscriptionDetail?.latestInvoice}
                  />
                </>
              )}
            </div>
            {/* TODO: this component will change a bit, so I'll leave this as is */}
            <div className="flex-1 mt-4 sm:mt-0">
              <UserManagement provider={provider} owner={owner} />
            </div>
          </>
        ) : (
          // TODO: I have to confirm if we can run into this case any more
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
