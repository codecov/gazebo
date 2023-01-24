import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { CollectionMethods, isEnterprisePlan } from 'shared/utils/billing'
import A from 'ui/A'

function getShouldShowUpgradePlan(accountDetails) {
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD

  return !(isEnterprisePlan(plan?.value) || isInvoicedCustomer)
}

function Activation() {
  const { owner, provider } = useParams()
  const { data: accountDetails } = useAccountDetails({ owner, provider })

  const activatedUserCount = accountDetails?.activatedUserCount || 0
  const planQuantity = accountDetails?.plan?.quantity || 0

  const showUpgradePlan = getShouldShowUpgradePlan(accountDetails)

  return (
    <div className="flex flex-col p-4 gap-2">
      <h3 className="font-semibold">Member activation</h3>
      <p>
        <span className="font-semibold text-lg">{activatedUserCount}</span>{' '}
        active members of{' '}
        <span className="font-semibold text-lg">{planQuantity}</span> available
        seats{' '}
        {showUpgradePlan && (
          <span className="text-xs">
            <A to={{ pageName: 'upgradeOrgPlan' }} variant="semibold">
              change plan
            </A>
          </span>
        )}
      </p>
      {/* TODO: new feature https://www.figma.com/file/iNTJAiBYGem3A4LmI4gvKX/Plan-and-members?node-id=103%3A1696 */}
    </div>
  )
}

export default Activation
