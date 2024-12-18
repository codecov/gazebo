import { isSentryPlan, Plans } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'
import { IndividualPlan } from 'services/account'

function UpgradeDetails({ selectedPlan }: { selectedPlan: IndividualPlan }) {
  if (isSentryPlan(selectedPlan.value)) {
    return <SentryPlanDetails />
  } else if (selectedPlan?.value === Plans.USERS_TEAMM || selectedPlan?.value === Plans.USERS_TEAMY) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
