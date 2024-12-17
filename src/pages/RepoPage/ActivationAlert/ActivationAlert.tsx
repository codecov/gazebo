import { useParams } from 'react-router-dom'

import config from 'config'

import { usePlanData } from 'services/account'

import ActivationRequiredAlert from './ActivationRequiredAlert'
import ActivationRequiredSelfHosted from './ActivationRequiredSelfHosted'
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
    planData?.plan?.isFreePlan && !planData?.plan?.hasSeatsLeft

  const renderPaidPlanSeatsTakenAlert =
    !planData?.plan?.isFreePlan && !planData?.plan?.hasSeatsLeft

  const renderActivationRequiredAlert =
    !planData?.plan?.isFreePlan && planData?.plan?.hasSeatsLeft

  if (config.IS_SELF_HOSTED) {
    return <ActivationRequiredSelfHosted />
  }

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
