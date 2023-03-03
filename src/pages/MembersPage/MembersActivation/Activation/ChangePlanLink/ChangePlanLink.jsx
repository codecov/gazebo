import PropType from 'prop-types'

import config from 'config'

import { CollectionMethods, isEnterprisePlan } from 'shared/utils/billing'
import A from 'ui/A'

function ChangePlanLink({ accountDetails }) {
  accountDetails = undefined
  const isInvoicedCustomer =
    accountDetails?.subscriptionDetail?.collectionMethod ===
    CollectionMethods.INVOICED_CUSTOMER_METHOD
  const plan = accountDetails?.plan?.value

  if (config.IS_SELF_HOSTED || isInvoicedCustomer || isEnterprisePlan(plan)) {
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
  }).isRequired,
}

export default ChangePlanLink
