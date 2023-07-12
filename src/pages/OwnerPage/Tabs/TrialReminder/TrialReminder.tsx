import { differenceInCalendarDays } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { TrialStatuses, useTrialData } from 'services/trial'
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
  const cannotTrial = trialStatus === TrialStatuses.NEVER_TRIALED

  return { trialNotStarted, trialOngoing, trialExpired, cannotTrial }
}

const determineDateDiff = ({
  trialStartDate,
  trialEndDate,
}: {
  trialStartDate?: string | null
  trialEndDate?: string | null
}) => {
  let dateDiff = 0
  if (trialStartDate && trialEndDate) {
    dateDiff = differenceInCalendarDays(
      new Date(trialEndDate),
      new Date(trialStartDate)
    )
  }

  return dateDiff
}

// eslint-disable-next-line max-statements, complexity
const TrialReminder: React.FC = () => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()

  const { codecovTrialMvp } = useFlags({
    codecovTrialMvp: false,
  })

  const { data: accountData } = useAccountDetails({
    provider,
    owner,
    opts: { enabled: codecovTrialMvp },
  })

  const planValue = accountData?.plan?.value

  const { data: trialData } = useTrialData({
    provider,
    owner,
    opts: { enabled: codecovTrialMvp },
  })

  const trialStartDate = trialData?.plan?.trialStartDate
  const trialEndDate = trialData?.plan?.trialEndDate

  const { trialNotStarted, trialOngoing, trialExpired, cannotTrial } =
    determineTrialStates({
      trialStatus: trialData?.plan?.trialStatus,
    })

  const dateDiff = determineDateDiff({ trialStartDate, trialEndDate })

  if (
    (!isFreePlan(planValue) && !trialOngoing) ||
    cannotTrial ||
    !codecovTrialMvp
  ) {
    return null
  }

  if (trialNotStarted) {
    return (
      <div className="flex items-center font-semibold">
        {/* this is required because the A component has this random `[x: string]: any` record type on it */}
        {/* @ts-expect-error */}
        <A to={{ pageName: 'planTab' }}>&#128640; Trial Pro Team</A>
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
            <A to={{ pageName: 'planTab' }}>upgrade</A>
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
        <A to={{ pageName: 'planTab' }}>&#128640; Upgrade plan</A>
      </div>
    )
  }

  return null
}

export default TrialReminder
