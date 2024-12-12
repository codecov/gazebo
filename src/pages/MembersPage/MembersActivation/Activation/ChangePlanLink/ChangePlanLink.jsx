import PropType from 'prop-types'

import config from 'config'

import { CollectionMethods } from 'shared/utils/billing'
import A from 'ui/A'

function ChangePlanLink({ accountDetails, plan }) {
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD

  if (config.IS_SELF_HOSTED || isInvoicedCustomer || plan?.isEnterprisePlan) {
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
  }).isRequired,
  plan: PropType.object(),
}

export default ChangePlanLink
