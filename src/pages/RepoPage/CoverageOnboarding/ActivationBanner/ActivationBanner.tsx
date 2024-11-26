import { useParams } from 'react-router-dom'

import config from 'config'

import { TrialStatuses, usePlanData } from 'services/account'
import { isBasicPlan, isFreePlan } from 'shared/utils/billing'

import ActivationRequiredBanner from './ActivationRequiredBanner'
import ActivationRequiredSelfHosted from './ActivationRequiredSelfHosted'
import FreePlanSeatsLimitBanner from './FreePlanSeatsLimitBanner'
import PaidPlanSeatsLimitBanner from './PaidPlanSeatsLimitBanner'
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
  const isFreePlanValue = isFreePlan(planData?.plan?.value)

  if (config.IS_SELF_HOSTED) {
    return <ActivationRequiredSelfHosted />
  }

  if (isTrialEligible) {
    return <TrialEligibleBanner />
  }

  if (!seatsLimitReached && !isFreePlanValue) {
    return <ActivationRequiredBanner />
  }

  if (seatsLimitReached && isFreePlanValue) {
    return <FreePlanSeatsLimitBanner />
  }

  if (seatsLimitReached && !isFreePlanValue) {
    return <PaidPlanSeatsLimitBanner />
  }

  return null
}

export default ActivationBanner
