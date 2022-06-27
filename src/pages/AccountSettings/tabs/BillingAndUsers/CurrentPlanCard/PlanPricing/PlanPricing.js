import { planPropType } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'

function PlanPricing({ plan }) {
  if (isFreePlan(plan.value)) {
    return <h2 className="text-4xl">Free</h2>
  }

  if (
    plan.value === 'users-enterprisem' ||
    plan.value === 'users-enterprisey'
  ) {
    return <h2 className="text-4xl">Custom pricing</h2>
  }

  return <h2 className="text-4xl uppercase">${plan.baseUnitPrice}</h2>
}

PlanPricing.propTypes = {
  plan: planPropType,
}

export default PlanPricing
