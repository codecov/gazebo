import { useParams } from 'react-router-dom'

import { TrialStatuses, usePlanData } from 'services/account'
import { isBasicPlan } from 'shared/utils/billing'

import TrialEligibleBanner from './TrialEligibleBanner'

function ActivationBanner() {
  const { owner, provider } = useParams<{ owner: string; provider: string }>()
  const { data: planData } = usePlanData({
    owner,
    provider,
  })
  const isNewTrial = planData?.plan?.trialStatus === TrialStatuses.NOT_STARTED
  const isTrialEligible =
    isBasicPlan(planData?.plan?.value) &&
    planData?.hasPrivateRepos &&
    isNewTrial

  if (!isTrialEligible) {
    return null
  }

  return (
    <div className="mt-4">
      <TrialEligibleBanner />
    </div>
  )
}

export default ActivationBanner
