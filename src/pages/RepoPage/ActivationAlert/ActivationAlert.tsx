import { useParams } from 'react-router-dom'

import { usePlanData } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'

import FreePlanSeatsTakenAlert from './FreePlanSeatsTakenAlert'
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

  if (renderFreePlanSeatsTakenAlert) {
    return <FreePlanSeatsTakenAlert />
  }

  return <UnauthorizedRepoDisplay />
}

export default ActivationAlert
