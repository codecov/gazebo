import { differenceInCalendarDays } from 'date-fns'
import isUndefined from 'lodash/isUndefined'
import { useParams } from 'react-router-dom'

import config from 'config'

import { TrialStatuses, usePlanData } from 'services/account'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import { isFreePlan, isTrialPlan } from 'shared/utils/billing'

import ExpiredBanner from './ExpiredBanner'
import OngoingBanner from './OngoingBanner'

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

interface UrlParams {
  provider: string
  owner?: string
}

// eslint-disable-next-line complexity, max-statements
const TrialBanner: React.FC = () => {
  const { provider, owner } = useParams<UrlParams>()

  const { codecovTrialMvp } = useFlags({
    codecovTrialMvp: false,
  })

  const enableQuery = !!owner || codecovTrialMvp

  const { data: planData } = usePlanData({
    provider,
    owner: owner || '',
    opts: { enabled: enableQuery },
  })

  const { data: ownerData } = useOwner({
    username: owner,
    opts: { enabled: enableQuery },
  })

  const planName = planData?.plan?.planName
  const trialStatus = planData?.plan?.trialStatus
  const dateDiff = determineDateDiff({
    trialStartDate: planData?.plan?.trialStartDate,
    trialEndDate: planData?.plan?.trialEndDate,
  })

  // hide on "global" pages, trial flag, and if user does not belong to the org
  if (
    isUndefined(owner) ||
    !ownerData?.isCurrentUserPartOfOrg ||
    config.IS_SELF_HOSTED ||
    !codecovTrialMvp
  ) {
    return null
  }

  // user is not on a free plan, trial is currently on going
  // there are 3 or less days left, so display ongoing banner
  if (
    isTrialPlan(planName) &&
    trialStatus === TrialStatuses.ONGOING &&
    dateDiff < 4 &&
    dateDiff >= 0
  ) {
    return <OngoingBanner dateDiff={dateDiff} />
  }

  // user has a free plan again, and the trial status is expired
  if (isFreePlan(planName) && trialStatus === TrialStatuses.EXPIRED) {
    return <ExpiredBanner />
  }

  return null
}

export default TrialBanner
