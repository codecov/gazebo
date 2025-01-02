import PropTypes from 'prop-types'

const SENTRY_PRICE = 29

function PlanPricing({ plan, baseUnitPrice }) {
  if (plan?.isFreePlan) {
    return <h2 className="text-2xl font-semibold">Free</h2>
  }

  if (plan?.isEnterprisePlan) {
    return <h2 className="text-2xl font-semibold">Custom pricing</h2>
  }

  if (plan?.isSentryPlan) {
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
  baseUnitPrice: PropTypes.number.isRequired,
}

export default PlanPricing
