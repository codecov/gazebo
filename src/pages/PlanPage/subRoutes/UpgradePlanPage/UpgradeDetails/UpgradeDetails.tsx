import { isSentryPlan, Plan } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'

function UpgradeDetails({
  selectedPlan,
  isTeamPlan,
}: {
  selectedPlan: Plan
  isTeamPlan: boolean
}) {
  if (isSentryPlan(selectedPlan?.value)) {
    return <SentryPlanDetails />
  } else if (isTeamPlan) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
