import PropTypes from 'prop-types'

import { planPropType } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import A from 'ui/A'

function EnterprisePlanCard({ plan, scheduledPhase }) {
  return (
    <div className="flex flex-col border">
      <div className="p-4">
        <h2 className="font-semibold">{plan?.marketingName} plan</h2>
        <span className="text-ds-gray-quinary">Current plan</span>
      </div>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={plan?.benefits}
            iconName="check"
            iconColor="text-ds-pink-default"
          />
        </div>
        {scheduledPhase && (
          <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
        )}
      </div>
      <div className="p-4 text-xs">
        For help or changes to plan, connect with{' '}
        <A to={{ pageName: 'sales' }}>sales@codecov.io</A>
      </div>
    </div>
  )
}

EnterprisePlanCard.propTypes = {
  plan: planPropType,
  scheduledPhase: PropTypes.shape({
    quantity: PropTypes.number.isRequired,
    plan: PropTypes.string.isRequired,
    startDate: PropTypes.number.isRequired,
  }),
}

export default EnterprisePlanCard
