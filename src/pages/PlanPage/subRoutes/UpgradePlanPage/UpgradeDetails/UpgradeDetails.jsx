import { useParams } from 'react-router-dom'

import { useAccountDetails, useAvailablePlans } from 'services/account'
import { canApplySentryUpgrade } from 'shared/utils/billing'

import ProPlanDetails from './ProPlanDetails'
import SentryPlanDetails from './SentryPlanDetails'

function UpgradeDetails() {
  const { provider, owner } = useParams()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

  if (canApplySentryUpgrade({ plan, plans })) {
    return <SentryPlanDetails />
  }

  return <ProPlanDetails />
}

export default UpgradeDetails
