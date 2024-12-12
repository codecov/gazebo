import PropTypes from 'prop-types'

import { isFreePlan, isSentryPlan } from 'shared/utils/billing'

const SENTRY_PRICE = 29

function PlanPricing({ plan, value, baseUnitPrice }) {
  if (isFreePlan(value)) {
    return <h2 className="text-2xl font-semibold">Free</h2>
  }

  if (plan?.isEnterprisePlan) {
    return <h2 className="text-2xl font-semibold">Custom pricing</h2>
  }

  if (isSentryPlan(value)) {
    return <h2 className="text-2xl font-semibold">${SENTRY_PRICE}</h2>
  }

  return (
    <h2 className="text-xs font-semibold">
      <span className="text-2xl uppercase">${baseUnitPrice}</span> per
      user/month
    </h2>
  )
}

PlanPricing.propTypes = {
  plan: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  baseUnitPrice: PropTypes.number.isRequired,
}

export default PlanPricing
