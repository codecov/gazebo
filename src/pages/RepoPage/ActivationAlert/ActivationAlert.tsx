import { useParams } from 'react-router-dom'

import { usePlanData } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'

import ActivationRequiredAlert from './ActivationRequiredAlert'
import FreePlanSeatsTakenAlert from './FreePlanSeatsTakenAlert'
import PaidPlanSeatsTakenAlert from './PaidPlanSeatsTakenAlert'
import UnauthorizedRepoDisplay from './UnauthorizedRepoDisplay'

interface URLParams {
  provider: string
  owner: string
}

function ActivationAlert() {
  const { owner, provider } = useParams<URLParams>()
  const { data: planData } = usePlanData({
    owner,
    provider,
  })

  const renderFreePlanSeatsTakenAlert =
    isFreePlan(planData?.plan?.value) && !planData?.plan?.hasSeatsLeft

  const renderPaidPlanSeatsTakenAlert =
    !isFreePlan(planData?.plan?.value) && !planData?.plan?.hasSeatsLeft

  const renderActivationRequiredAlert =
    !isFreePlan(planData?.plan?.value) && planData?.plan?.hasSeatsLeft

  if (renderFreePlanSeatsTakenAlert) {
    return <FreePlanSeatsTakenAlert />
  }

  if (renderPaidPlanSeatsTakenAlert) {
    return <PaidPlanSeatsTakenAlert />
  }

  if (renderActivationRequiredAlert) {
    return <ActivationRequiredAlert />
  }

  return <UnauthorizedRepoDisplay />
}

export default ActivationAlert
