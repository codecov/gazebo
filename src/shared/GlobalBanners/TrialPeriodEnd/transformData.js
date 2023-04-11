import { differenceInDays } from 'date-fns'
import isNull from 'lodash/isNull'

export function transformData(subscriptionDetail) {
  if (isNull(subscriptionDetail)) {
    return {
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    }
  }

  if (
    !subscriptionDetail.trialEnd ||
    !isNull(subscriptionDetail.defaultPaymentMethod)
  ) {
    return {
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    }
  }

  const trialEndDate = new Date(subscriptionDetail.trialEnd * 1000)
  const daysLeftInTrial = differenceInDays(trialEndDate, Date.now())
  const thresholdDisplayValue = 7

  if (daysLeftInTrial > thresholdDisplayValue) {
    return {
      daysLeftInTrial: undefined,
      shouldHideBanner: true,
    }
  }

  return {
    daysLeftInTrial,
    shouldHideBanner: false,
  }
}
