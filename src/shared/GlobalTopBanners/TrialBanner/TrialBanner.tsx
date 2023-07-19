import { differenceInCalendarDays } from 'date-fns'
import isUndefined from 'lodash/isUndefined'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { TrialStatuses, useTrialData } from 'services/trial'
import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import { isFreePlan } from 'shared/utils/billing'

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

  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: { enabled: enableQuery },
  })

  const { data: trialData } = useTrialData({
    provider,
    owner: owner || '',
    opts: { enabled: enableQuery },
  })

  const { data: ownerData } = useOwner({
    username: owner,
    opts: { enabled: enableQuery },
  })

  const planValue = accountDetails?.plan?.value
  const trialStatus = trialData?.trialStatus
  const dateDiff = determineDateDiff({ trialStartDate: '', trialEndDate: '' })

  // hide on "global" pages, trial flag, and if user does not belong to the org
  if (
    isUndefined(owner) ||
    !ownerData?.isCurrentUserPartOfOrg ||
    !codecovTrialMvp
  ) {
    return null
  }

  // user is not on a free plan, trial is currently on going
  // there are 3 or less days left, so display ongoing banner
  if (
    !isFreePlan(planValue) &&
    trialStatus === TrialStatuses.ONGOING &&
    dateDiff < 4
  ) {
    return <OngoingBanner dateDiff={dateDiff} />
  }

  // user has a free plan again, and the trial status is expired
  if (isFreePlan(planValue) && trialStatus === TrialStatuses.EXPIRED) {
    return <ExpiredBanner />
  }

  return null
}

export default TrialBanner
