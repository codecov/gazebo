import { IndividualPlan } from 'services/account'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'

function UpgradeDetails({ selectedPlan }: { selectedPlan: IndividualPlan }) {
  if (selectedPlan.isSentryPlan) {
    return <SentryPlanDetails />
  } else if (selectedPlan.isTeamPlan) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
