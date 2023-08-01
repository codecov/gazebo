import { differenceInCalendarDays } from 'date-fns'
import { useParams } from 'react-router-dom'

import config from 'config'

import { TrialStatuses, usePlanData } from 'services/account'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import { isFreePlan } from 'shared/utils/billing'
import A from 'ui/A/A'

const determineTrialStates = ({
  trialStatus,
}: {
  trialStatus?: keyof typeof TrialStatuses
}) => {
  const trialNotStarted = trialStatus === TrialStatuses.NOT_STARTED
  const trialOngoing = trialStatus === TrialStatuses.ONGOING
  const trialExpired = trialStatus === TrialStatuses.EXPIRED
  const cannotTrial = trialStatus === TrialStatuses.CANNOT_TRIAL

  return { trialNotStarted, trialOngoing, trialExpired, cannotTrial }
}

const determineDateDiff = ({
  trialEndDate,
}: {
  trialEndDate?: string | null
}) => {
  let dateDiff = 0
  if (trialEndDate) {
    dateDiff = differenceInCalendarDays(new Date(trialEndDate), new Date())
  }

  return dateDiff
}

// eslint-disable-next-line max-statements, complexity
const TrialReminder: React.FC = () => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()

  const { codecovTrialMvp } = useFlags({
    codecovTrialMvp: false,
  })

  const { data: ownerData } = useOwner({
    username: owner,
    opts: { enabled: codecovTrialMvp },
  })

  const { data: planData } = usePlanData({
    provider,
    owner,
    opts: {
      enabled: codecovTrialMvp,
    },
  })

  const planValue = planData?.plan?.planName

  const { trialNotStarted, trialOngoing, trialExpired, cannotTrial } =
    determineTrialStates({
      trialStatus: planData?.plan?.trialStatus,
    })

  const dateDiff = determineDateDiff({
    trialEndDate: planData?.plan?.trialEndDate,
  })
  if (
    (!isFreePlan(planValue) && !trialOngoing) ||
    cannotTrial ||
    !ownerData?.isCurrentUserPartOfOrg ||
    config.IS_SELF_HOSTED ||
    !codecovTrialMvp
  ) {
    return null
  }

  if (trialNotStarted) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error */}
        <A to={{ pageName: 'upgradeOrgPlan' }}>&#128640; Trial Pro Team</A>
      </div>
    )
  }

  if (trialOngoing && dateDiff > 3) {
    return (
      <div className="flex items-center">
        <p>
          Trial is active with {dateDiff} days{' '}
          <span className="font-semibold">
            {/* this is required because the A component has this random `[x: string]: any` record type on it */}
            {/* @ts-expect-error */}
            <A to={{ pageName: 'upgradeOrgPlan' }}>upgrade</A>
          </span>
        </p>
      </div>
    )
  }

  if (trialExpired && isFreePlan(planValue)) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error*/}
        <A to={{ pageName: 'upgradeOrgPlan' }}>&#128640; Upgrade plan</A>
      </div>
    )
  }

  return null
}

export default TrialReminder
