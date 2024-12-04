import { format, fromUnixTime } from 'date-fns'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import { z } from 'zod'

import { AccountDetailsSchema } from 'services/account'

export const Plans = {
  USERS: 'users',
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
} as const

export type PlanName = (typeof Plans)[keyof typeof Plans]

export interface Plan {
  baseUnitPrice: number
  benefits: string[]
  billingRate: string | null
  marketingName: string
  value: PlanName
  monthlyUploadLimit: number | null
  quantity?: number
}

export const EnterprisePlans = Object.freeze({
  USERS_ENTERPRISEM: 'users-enterprisem',
  USERS_ENTERPRISEY: 'users-enterprisey',
})

export function isEnterprisePlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return (Object.values(EnterprisePlans) as string[]).includes(plan)
  }

  return false
}

export function isFreePlan(plan?: PlanName | null) {
  if (isString(plan)) {
    if (plan === Plans.USERS_BASIC || plan === Plans.USERS_FREE) return true
  }
  return false
}

export function isTeamPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    if (plan === Plans.USERS_TEAMM || plan === Plans.USERS_TEAMY) return true
  }
  return false
}
export function isBasicPlan(plan?: PlanName) {
  if (isString(plan)) {
    return plan === Plans.USERS_BASIC
  }
  return false
}

export function isPaidPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return isAnnualPlan(plan) || isMonthlyPlan(plan)
  }
  return false
}

export function isMonthlyPlan(plan?: PlanName | null) {
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

export function isAnnualPlan(plan?: PlanName | null) {
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

export function isSentryPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return plan === Plans.USERS_SENTRYM || plan === Plans.USERS_SENTRYY
  }
  return false
}

export function isCodecovProPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return plan === Plans.USERS_PR_INAPPM || plan === Plans.USERS_PR_INAPPY
  }
  return false
}

export function isProPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return isSentryPlan(plan) || isCodecovProPlan(plan)
  }
  return false
}

export function isTrialPlan(plan?: PlanName | null) {
  if (isString(plan)) {
    return plan === Plans.USERS_TRIAL
  }

  return false
}

export const CollectionMethods = Object.freeze({
  INVOICED_CUSTOMER_METHOD: 'send_invoice',
  AUTOMATICALLY_CHARGED_METHOD: 'charge_automatically',
})

export function useProPlans({ plans }: { plans?: Plan[] | null }) {
  const proPlanMonth = plans?.find(
    (plan) => plan.value === Plans.USERS_PR_INAPPM
  )

  const proPlanYear = plans?.find(
    (plan) => plan.value === Plans.USERS_PR_INAPPY
  )

  return {
    proPlanMonth,
    proPlanYear,
  }
}

export const findProPlans = ({ plans }: { plans?: Plan[] | null }) => {
  const proPlanMonth = plans?.find(
    (plan) => plan.value === Plans.USERS_PR_INAPPM
  )
  const proPlanYear = plans?.find(
    (plan) => plan.value === Plans.USERS_PR_INAPPY
  )

  return {
    proPlanMonth,
    proPlanYear,
  }
}

export const findSentryPlans = ({ plans }: { plans?: Plan[] | null }) => {
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

export const findTeamPlans = ({ plans }: { plans?: Plan[] | null }) => {
  const teamPlanMonth = plans?.find((plan) => plan.value === Plans.USERS_TEAMM)
  const teamPlanYear = plans?.find((plan) => plan.value === Plans.USERS_TEAMY)

  return {
    teamPlanMonth,
    teamPlanYear,
  }
}

export const canApplySentryUpgrade = ({
  plan,
  plans,
}: {
  plan?: PlanName
  plans?: Plan[] | null
}) => {
  if (isEnterprisePlan(plan) || !isArray(plans)) {
    return false
  }

  return plans?.some(
    (plan) =>
      plan?.value === Plans.USERS_SENTRYM || plan?.value === Plans.USERS_SENTRYY
  )
}

export const shouldDisplayTeamCard = ({ plans }: { plans?: Plan[] | null }) => {
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })

  return !isUndefined(teamPlanMonth) && !isUndefined(teamPlanYear)
}

export const formatNumberToUSD = (value: number) =>
  Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(value)

export function getNextBillingDate(
  accountDetails?: z.infer<typeof AccountDetailsSchema> | null
) {
  const timestamp = accountDetails?.subscriptionDetail?.latestInvoice?.periodEnd
  return timestamp ? format(fromUnixTime(timestamp), 'MMMM do, yyyy') : null
}

// TODO: This is now the preferred format for dates, please use this over any other formatting
export function formatTimestampToCalendarDate(
  timestamp: number | null | undefined
) {
  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp * 1000)
  const options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  // @ts-expect-error Complaining about year not being type 'numeric' | '2-digit' | 'undefined'
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function lastTwoDigits(value: number | string) {
  if (typeof value === 'number' || typeof value === 'string') {
    return value.toString().slice(-2)
  }
  return null
}
