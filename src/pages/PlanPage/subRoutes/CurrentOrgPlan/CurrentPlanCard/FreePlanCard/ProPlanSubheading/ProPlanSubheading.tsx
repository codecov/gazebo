import { useParams } from 'react-router-dom'

import { TrialStatuses, usePlanData } from 'services/account/usePlanData'
import A from 'ui/A'

interface Params {
  provider: string
  owner: string
}

function ProPlanSubheading() {
  const { provider, owner } = useParams<Params>()

  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  // user can start a trial
  // - user on a free plan
  // - trial status is not started
  // - org has private repos
  if (
    planData?.plan?.isFreePlan &&
    planData?.plan?.trialStatus === TrialStatuses.NOT_STARTED &&
    planData?.hasPrivateRepos
  ) {
    return (
      <p className="text-ds-gray-quinary">
        {/* @ts-expect-error - A hasn't been typed yet */}
        Includes 14-day free trial <A to={{ pageName: 'freeTrialFaqs' }}>FAQ</A>
      </p>
    )
  }

  // user currently is on trial
  // - user is on a trial plan
  // - trial status is currently ongoing
  if (
    planData?.plan?.isTrialPlan &&
    planData?.plan?.trialStatus === TrialStatuses.ONGOING
  ) {
    return (
      <p className="text-ds-gray-quinary">
        {/* @ts-expect-error - A hasn't been typed yet */}
        Current trial <A to={{ pageName: 'freeTrialFaqs' }}>FAQ</A>
      </p>
    )
  }

  // user has an expired trial
  // - user is currently on a free plan
  // - trial status is expired
  if (
    planData?.plan?.isFreePlan &&
    planData?.plan?.trialStatus === TrialStatuses.EXPIRED
  ) {
    return <p className="text-ds-gray-quinary">Your org trialed this plan</p>
  }

  return null
}

export default ProPlanSubheading
