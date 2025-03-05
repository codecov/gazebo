import { differenceInCalendarDays } from 'date-fns'
import { useParams } from 'react-router-dom'

import config from 'config'

import { TrialStatuses, usePlanData } from 'services/account/usePlanData'
import { useOwner } from 'services/user'
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

const TrialReminder: React.FC = () => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()

  const { data: ownerData } = useOwner({
    username: owner,
    opts: { enabled: !config.IS_SELF_HOSTED },
  })

  const { data: planData } = usePlanData({
    provider,
    owner,
    opts: {
      enabled: !config.IS_SELF_HOSTED,
    },
  })

  const { trialNotStarted, trialOngoing, trialExpired, cannotTrial } =
    determineTrialStates({
      trialStatus: planData?.plan?.trialStatus,
    })

  const dateDiff = determineDateDiff({
    trialEndDate: planData?.plan?.trialEndDate,
  })
  if (
    (!planData?.plan?.isFreePlan && !trialOngoing) ||
    cannotTrial ||
    !ownerData?.isCurrentUserPartOfOrg ||
    config.IS_SELF_HOSTED
  ) {
    return null
  }

  if (trialNotStarted && planData?.hasPrivateRepos) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error - A hasn't been typed yet */}
        <A to={{ pageName: 'planTab' }}>&#128640; Try Codecov Pro</A>
      </div>
    )
  }

  if (trialOngoing && dateDiff > 3) {
    return (
      <div className="flex items-center">
        <p>
          Trial active for {dateDiff} days.{' '}
          <span className="font-semibold">
            {/* this is required because the A component has this random `[x: string]: any` record type on it */}
            {/* @ts-expect-error - A hasn't been typed yet */}
            <A to={{ pageName: 'upgradeOrgPlan' }}>Upgrade now</A>
          </span>
        </p>
      </div>
    )
  }

  if (trialExpired && planData?.plan?.isFreePlan) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error - A hasn't been typed yet */}
        <A to={{ pageName: 'upgradeOrgPlan' }}>&#128640; Upgrade plan</A>
      </div>
    )
  }

  return null
}

export default TrialReminder
