import PropTypes from 'prop-types'

import {
  CollectionMethods,
  isEnterprisePlan,
  isFreePlan,
  isPaidPlan,
} from 'shared/utils/billing'
import A from 'ui/A'

function HelpMessage({ collectionMethod, plan }) {
  const isInvoicedCustomer =
    collectionMethod === CollectionMethods.INVOICED_CUSTOMER_METHOD

  if (isFreePlan(plan)) return null

  if (isEnterprisePlan(plan) || isInvoicedCustomer) {
    return (
      <div className="text-xs">
        For help or changes to plan, connect with{' '}
        <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </div>
    )
  }

  if (isPaidPlan(plan)) {
    return (
      <div className="text-xs">
        <A to={{ pageName: 'sales' }}>Contact sales</A> to discuss custom
        Enterprise plans
      </div>
    )
  }
}

HelpMessage.propTypes = {
  collectionMethod: PropTypes.string,
  plan: PropTypes.object.isRequired,
}

export default HelpMessage
