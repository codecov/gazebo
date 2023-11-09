import { z } from 'zod'

import { IndividualPlanSchema } from 'services/account'
import { Plans } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'
import TeamPlanDetails from './TeamPlanDetails'

function UpgradeDetails({
  selectedPlan,
}: {
  selectedPlan: z.infer<typeof IndividualPlanSchema>
}) {
  if (selectedPlan?.value === Plans.USERS_SENTRYY) {
    return <SentryPlanDetails />
  } else if (selectedPlan?.value === Plans.USERS_TEAMY) {
    return <TeamPlanDetails />
  } else {
    return <ProPlanDetails />
  }
}

export default UpgradeDetails
