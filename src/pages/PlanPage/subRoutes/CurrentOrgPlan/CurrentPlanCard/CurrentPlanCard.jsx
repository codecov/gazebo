import PropTypes from 'prop-types'

import { planPropType } from 'services/account'
import { isEnterprisePlan, isFreePlan } from 'shared/utils/billing'

import EnterprisePlanCard from './EnterprisePlanCard'
import FreePlanCard from './FreePlanCard'
import ProPlanCard from './ProPlanCard'

function CurrentPlanCard({ plan, isInvoicedCustomer, scheduledPhase }) {
  if (isFreePlan(plan?.value)) {
    return <FreePlanCard plan={plan} scheduledPhase={scheduledPhase} />
  }

  if (isEnterprisePlan(plan?.value) || isInvoicedCustomer) {
    return <EnterprisePlanCard plan={plan} />
  }

  return <ProPlanCard plan={plan} scheduledPhase={scheduledPhase} />
}

CurrentPlanCard.propTypes = {
  plan: planPropType.isRequired,
  scheduledPhase: PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    plan: PropTypes.string.isRequired,
    startDate: PropTypes.number.isRequired,
  }),
  isInvoicedCustomer: PropTypes.bool.isRequired,
}

export default CurrentPlanCard
