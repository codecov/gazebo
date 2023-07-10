import { differenceInCalendarDays } from 'date-fns'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { TrialStatuses, useTrialData } from 'services/trial'
import { useFlags } from 'shared/featureFlags'
import { isFreePlan } from 'shared/utils/billing'

const isTrialStarted = ({
  trialStatus,
}: {
  trialStatus?: keyof typeof TrialStatuses | null
}) => trialStatus === TrialStatuses.NOT_STARTED

const isTrialOngoing = ({
  trialStatus,
}: {
  trialStatus?: keyof typeof TrialStatuses | null
}) => trialStatus === TrialStatuses.ONGOING

const isTrialExpired = ({
  trialStatus,
}: {
  trialStatus?: keyof typeof TrialStatuses | null
}) => trialStatus === TrialStatuses.EXPIRED

const calculateDateDiff = ({
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

export const useTrialReminderData = () => {
  const { codecovTrialMvp } = useFlags({
    codecovTrialMvp: false,
  })

  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: trialData } = useTrialData({
    provider,
    owner,
    opts: { enabled: codecovTrialMvp },
  })

  const { data: accountData } = useAccountDetails({
    provider,
    owner,
    opts: { enabled: codecovTrialMvp },
  })

  const dateDiff = calculateDateDiff({
    trialStartDate: trialData?.plan?.trialStartDate,
    trialEndDate: trialData?.plan?.trialEndDate,
  })

  const trialOngoing =
    isTrialOngoing({ trialStatus: trialData?.plan?.trialStatus }) &&
    dateDiff > 3

  return {
    dateDiff,
    hideComponent:
      (!isFreePlan(accountData?.plan?.value) && !trialOngoing) ||
      !codecovTrialMvp,
    trialNotStarted: isTrialStarted({
      trialStatus: trialData?.plan?.trialStatus,
    }),
    trialOngoing,
    trialExpired:
      isTrialExpired({ trialStatus: trialData?.plan?.trialStatus }) &&
      isFreePlan(accountData?.plan?.value),
  }
}
