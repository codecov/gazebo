import { isSentryPlan, Plan, Plans } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'

function UpgradeDetails({ selectedPlan }: { selectedPlan: Plan }) {
  if (isSentryPlan(selectedPlan?.value)) {
    return <SentryPlanDetails />
  } else if (selectedPlan?.value === Plans.USERS_TEAMM || Plans.USERS_TEAMY) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
