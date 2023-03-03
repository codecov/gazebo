import { format, fromUnixTime } from 'date-fns'

import { useFlags } from 'shared/featureFlags'

export const Plans = Object.freeze({
  USERS_FREE: 'users-free',
  USERS_BASIC: 'users-basic',
  USERS_INAPP: 'users-inappm',
  USERS_INAPPY: 'users-inappy',
  USERS_PR_INAPPM: 'users-pr-inappm',
  USERS_PR_INAPPY: 'users-pr-inappy',
  USERS_ENTERPRISEM: 'users-enterprisem',
  USERS_ENTERPRISEY: 'users-enterprisey',
})

export const EnterprisePlans = Object.freeze({
  USERS_ENTERPRISEM: 'users-enterprisem',
  USERS_ENTERPRISEY: 'users-enterprisey',
})

export function isEnterprisePlan(plan) {
  if (typeof plan !== 'string') return false
  return Object.values(EnterprisePlans).includes(plan)
}

export function isFreePlan(plan) {
  if (typeof plan !== 'string') return false
  if (plan === Plans.USERS_BASIC || plan === Plans.USERS_FREE) return true
  return false
}

export const CollectionMethods = Object.freeze({
  INVOICED_CUSTOMER_METHOD: 'send_invoice',
  AUTOMATICALLY_CHARGED_METHOD: 'charge_automatically',
})

export function useProPlans({ plans }) {
  const { enterpriseCloudPlanSupport } = useFlags({
    enterpriseCloudPlanSupport: true,
  })

  const proPlanMonth = enterpriseCloudPlanSupport
    ? plans?.find(
        (plan) =>
          plan.value === Plans.USERS_PR_INAPPM ||
          plan.value === EnterprisePlans.USERS_ENTERPRISEM
      )
    : plans?.find((plan) => plan.value === Plans.USERS_PR_INAPPM)

  const proPlanYear = enterpriseCloudPlanSupport
    ? plans?.find(
        (plan) =>
          plan.value === Plans.USERS_PR_INAPPY ||
          plan.value === EnterprisePlans.USERS_ENTERPRISEY
      )
    : plans?.find((plan) => plan.value === Plans.USERS_PR_INAPPY)

  return {
    proPlanMonth,
    proPlanYear,
  }
}

export const formatNumberToUSD = (value) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(value)

export function getNextBillingDate(accountDetails) {
  const timestamp = accountDetails?.latestInvoice?.periodEnd
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
}
