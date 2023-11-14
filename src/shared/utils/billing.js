import { format, fromUnixTime } from 'date-fns'
import { isUndefined } from 'lodash'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'

import { useFlags } from 'shared/featureFlags'

export const Plans = Object.freeze({
  USERS_FREE: 'users-free',
  USERS_BASIC: 'users-basic',
  USERS_TRIAL: 'users-trial',
  USERS_INAPP: 'users-inappm',
  USERS_INAPPY: 'users-inappy',
  USERS_PR_INAPPM: 'users-pr-inappm',
  USERS_PR_INAPPY: 'users-pr-inappy',
  USERS_SENTRYM: 'users-sentrym',
  USERS_SENTRYY: 'users-sentryy',
  USERS_TEAMM: 'users-teamm',
  USERS_TEAMY: 'users-teamy',
  USERS_ENTERPRISEM: 'users-enterprisem',
  USERS_ENTERPRISEY: 'users-enterprisey',
})

export const EnterprisePlans = Object.freeze({
  USERS_ENTERPRISEM: 'users-enterprisem',
  USERS_ENTERPRISEY: 'users-enterprisey',
})

export function isEnterprisePlan(plan) {
  if (isString(plan)) {
    return Object.values(EnterprisePlans).includes(plan)
  }
  return false
}

export function isFreePlan(plan) {
  if (isString(plan)) {
    if (plan === Plans.USERS_BASIC || plan === Plans.USERS_FREE) return true
  }
  return false
}

export function isTeamPlan(plan) {
  if (isString(plan)) {
    if (plan === Plans.USERS_TEAMM || plan === Plans.USERS_TEAMY) return true
  }
  return false
}
export function isBasicPlan(plan) {
  if (isString(plan)) {
    return plan === Plans.USERS_BASIC
  }
  return false
}

export function isPaidPlan(plan) {
  if (isString(plan)) {
    return isAnnualPlan(plan) || isMonthlyPlan(plan)
  }
  return false
}

export function isMonthlyPlan(plan) {
  if (isString(plan)) {
    return (
      plan === Plans.USERS_INAPP ||
      plan === Plans.USERS_PR_INAPPM ||
      plan === Plans.USERS_SENTRYM ||
      plan === Plans.USERS_TEAMM ||
      plan === Plans.USERS_ENTERPRISEM
    )
  }
  return false
}

export function isAnnualPlan(plan) {
  if (isString(plan)) {
    return (
      plan === Plans.USERS_INAPPY ||
      plan === Plans.USERS_PR_INAPPY ||
      plan === Plans.USERS_TEAMY ||
      plan === Plans.USERS_SENTRYY ||
      plan === Plans.USERS_ENTERPRISEY
    )
  }
  return false
}

export function isSentryPlan(plan) {
  if (isString(plan)) {
    return plan === Plans.USERS_SENTRYM || plan === Plans.USERS_SENTRYY
  }
  return false
}

export function isTrialPlan(plan) {
  if (isString(plan)) {
    return plan === Plans.USERS_TRIAL
  }

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

export const findSentryPlans = ({ plans }) => {
  const sentryPlanMonth = plans?.find(
    (plan) => plan.value === Plans.USERS_SENTRYM
  )
  const sentryPlanYear = plans?.find(
    (plan) => plan.value === Plans.USERS_SENTRYY
  )

  return {
    sentryPlanMonth,
    sentryPlanYear,
  }
}

export const findTeamPlans = ({ plans }) => {
  const teamPlanMonth = plans?.find((plan) => plan.value === Plans.USERS_TEAMM)
  const teamPlanYear = plans?.find((plan) => plan.value === Plans.USERS_TEAMY)

  return {
    teamPlanMonth,
    teamPlanYear,
  }
}

export const canApplySentryUpgrade = ({ plan, plans }) => {
  if (isEnterprisePlan(plan) || !isArray(plans)) {
    return false
  }

  return plans?.some(
    (plan) =>
      plan?.value === Plans.USERS_SENTRYM || plan?.value === Plans.USERS_SENTRYY
  )
}

export const shouldDisplayTeamCard = ({ plans }) => {
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })

  return !isUndefined(teamPlanMonth) && !isUndefined(teamPlanYear)
}

export const formatNumberToUSD = (value) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(value)

export function getNextBillingDate(accountDetails) {
  const timestamp = accountDetails?.subscriptionDetail?.latestInvoice?.periodEnd
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
}
