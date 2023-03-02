import PropType from 'prop-types'

import config from 'config'

import { CollectionMethods, isEnterprisePlan } from 'shared/utils/billing'
import A from 'ui/A'

function ChangePlanLink({ accountDetails }) {
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD
  const plan = accountDetails?.plan?.value

  const showChangePlanLink = !(
    config.IS_SELF_HOSTED ||
    isInvoicedCustomer ||
    isEnterprisePlan(plan)
  )

  if (!showChangePlanLink) {
    return null
  }

  return (
    <span className="text-xs">
      <A to={{ pageName: 'upgradeOrgPlan' }} variant="semibold">
        change plan
      </A>
    </span>
  )
}

ChangePlanLink.propTypes = {
  accountDetails: PropType.shape({
    subscriptionDetail: PropType.shape({ collectionMethod: PropType.string }),
    plan: PropType.shape({ value: PropType.string }),
  }),
}

export default ChangePlanLink
