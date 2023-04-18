import { differenceInDays } from 'date-fns'

interface SubscriptionDetail {
  readonly trialEnd?: number | null
  readonly defaultPaymentMethod?: object | null
}

export function transformData(subscriptionDetail?: SubscriptionDetail | null) {
  if (
    subscriptionDetail &&
    subscriptionDetail?.trialEnd &&
    !subscriptionDetail?.defaultPaymentMethod
  ) {
    const trialEndDate = new Date(subscriptionDetail.trialEnd * 1000)
    const daysLeftInTrial = differenceInDays(trialEndDate, Date.now())
    const thresholdDisplayValue = 7

    if (daysLeftInTrial <= thresholdDisplayValue) {
      return {
        daysLeftInTrial,
        shouldShowBanner: true,
      }
    }
  }

  return {
    daysLeftInTrial: undefined,
    shouldShowBanner: false,
  }
}
