import { useParams } from 'react-router-dom'

import { TrialStatuses, usePlanData } from 'services/account'
import { isBasicPlan, isFreePlan } from 'shared/utils/billing'

import ActivationRequiredBanner from './ActivationRequiredBanner'
import TrialEligibleBanner from './TrialEligibleBanner'

interface URLParams {
  provider: string
  owner: string
}

function ActivationBanner() {
  const { owner, provider } = useParams<URLParams>()
  const { data: planData } = usePlanData({
    owner,
    provider,
  })
  const isNewTrial = planData?.plan?.trialStatus === TrialStatuses.NOT_STARTED
  const isTrialEligible =
    isBasicPlan(planData?.plan?.value) &&
    planData?.hasPrivateRepos &&
    isNewTrial
  const seatsLimitReached = !planData?.plan?.hasSeatsLeft

  if (isTrialEligible) {
    return <TrialEligibleBanner />
  }

  if (!seatsLimitReached && !isFreePlan(planData?.plan?.value)) {
    return <ActivationRequiredBanner />
  }

  return null
}

export default ActivationBanner
