import isUndefined from 'lodash/isUndefined'
import { useParams } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'
import { TrialStatuses, useTrialData } from 'services/trial'
import {
  canApplySentryUpgrade,
  findSentryPlans,
  isFreePlan,
  isSentryPlan,
} from 'shared/utils/billing'

import StartTrialBanner from './StartTrialBanner'
import { differenceInCalendarDays } from 'date-fns'
import OngoingBanner from './OngoingBanner'
import ExpiredBanner from './ExpiredBanner'

const isOnSentryPlan = ({
  plans,
  planValue,
}: {
  /* TODO: update with plan type when 2044 is merged in */
  plans: any
  planValue: string
}) => {
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const alreadyOnSentryPlan = isSentryPlan(planValue)

  return (
    isUndefined(sentryPlanMonth) ||
    isUndefined(sentryPlanYear) ||
    alreadyOnSentryPlan
  )
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

interface UrlParams {
  provider: string
  owner: string | undefined
}

// eslint-disable-next-line complexity, max-statements
const SentryTrialBanner: React.FC = () => {
  const { provider, owner } = useParams<UrlParams>()
  const { data: plans } = usePlans(provider)
  const { data: accountDetails } = useAccountDetails({
    provider,
    owner,
    opts: {
      enabled: !!owner,
    },
  })
  const planValue = accountDetails?.plan?.value

  const { data: trialData } = useTrialData({
    provider,
    owner: owner || '',
    opts: {
      enabled: !!owner,
    },
  })
  const trialStatus = trialData?.trialStatus

  const dateDiff = determineDateDiff({ trialStartDate: '', trialEndDate: '' })

  // hide on "global" pages
  if (isUndefined(owner)) {
    return null
  }

  // user is not on a sentry plan but has access to sentry bundle
  if (
    trialStatus === TrialStatuses.NOT_STARTED &&
    !isOnSentryPlan({ plans, planValue }) &&
    canApplySentryUpgrade({ plan: planValue, plans })
  ) {
    return <StartTrialBanner />
  }

  // user is on a free plan
  if (isFreePlan(planValue) && trialStatus === TrialStatuses.NOT_STARTED) {
    return <StartTrialBanner />
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

export default SentryTrialBanner
