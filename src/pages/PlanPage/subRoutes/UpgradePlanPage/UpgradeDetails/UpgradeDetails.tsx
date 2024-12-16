import { isSentryPlan, isTeamPlan, Plan } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'

function UpgradeDetails({ selectedPlan }: { selectedPlan: Plan }) {
  if (isSentryPlan(selectedPlan.value)) {
    return <SentryPlanDetails />
  } else if (isTeamPlan(selectedPlan.value)) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
