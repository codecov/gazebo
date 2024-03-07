import { differenceInCalendarDays } from 'date-fns'
import isUndefined from 'lodash/isUndefined'
import { useLocation, useParams } from 'react-router-dom'

import config from 'config'

import { TrialStatuses, usePlanData } from 'services/account'
import { useOwner } from 'services/user'
import { isFreePlan, isTrialPlan } from 'shared/utils/billing'

import ExpiredBanner from './ExpiredBanner'
import OngoingBanner from './OngoingBanner'

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

const startsWithPlan = (pathName: string): boolean => {
  return pathName.startsWith('/plan')
}

interface UrlParams {
  provider?: string
  owner?: string
}

const TrialBanner: React.FC = () => {
  const { provider, owner } = useParams<UrlParams>()
  const currentPathName = useLocation().pathname
  const pathStartsWithPlan = startsWithPlan(currentPathName)

  const enableQuery = !!owner

  let providerString = ''
  if (provider) {
    providerString = provider
  }

  const { data: ownerData } = useOwner({
    username: owner,
    opts: { enabled: enableQuery },
  })
  const { data: planData } = usePlanData({
    provider: providerString,
    owner: owner || '',
    opts: { enabled: ownerData?.isCurrentUserPartOfOrg },
  })

  const planValue = planData?.plan?.value
  const trialStatus = planData?.plan?.trialStatus
  const dateDiff = determineDateDiff({
    trialEndDate: planData?.plan?.trialEndDate,
  })

  // hide on "global" pages, trial flag, and if user does not belong to the org
  if (
    isUndefined(provider) ||
    isUndefined(owner) ||
    !ownerData?.isCurrentUserPartOfOrg ||
    config.IS_SELF_HOSTED ||
    pathStartsWithPlan
  ) {
    return null
  }

  // user is not on a free plan, trial is currently on going
  // there are 3 or less days left, so display ongoing banner
  if (
    isTrialPlan(planValue) &&
    trialStatus === TrialStatuses.ONGOING &&
    dateDiff < 4 &&
    dateDiff >= 0
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
