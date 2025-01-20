import { format, fromUnixTime } from 'date-fns'
import isArray from 'lodash/isArray'
import isUndefined from 'lodash/isUndefined'
import { z } from 'zod'

import { AccountDetailsSchema, IndividualPlan } from 'services/account'

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

export const TierNames = {
  BASIC: 'basic',
  TEAM: 'team',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export const BillingRate = {
  MONTHLY: 'monthly',
  ANNUALLY: 'annually',
} as const

export const CollectionMethods = Object.freeze({
  INVOICED_CUSTOMER_METHOD: 'send_invoice',
  AUTOMATICALLY_CHARGED_METHOD: 'charge_automatically',
})

export const findProPlans = ({
  plans,
}: {
  plans?: IndividualPlan[] | null
}) => {
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

export const findSentryPlans = ({
  plans,
}: {
  plans?: IndividualPlan[] | null
}) => {
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

export const findTeamPlans = ({
  plans,
}: {
  plans?: IndividualPlan[] | null
}) => {
  const teamPlanMonth = plans?.find((plan) => plan.value === Plans.USERS_TEAMM)
  const teamPlanYear = plans?.find((plan) => plan.value === Plans.USERS_TEAMY)

  return {
    teamPlanMonth,
    teamPlanYear,
  }
}

export const canApplySentryUpgrade = ({
  isEnterprisePlan,
  plans,
}: {
  isEnterprisePlan?: boolean
  plans?: IndividualPlan[] | null
}) => {
  if (isEnterprisePlan || !isArray(plans)) {
    return false
  }

  return plans?.some(
    (plan) =>
      plan?.value === Plans.USERS_SENTRYM || plan?.value === Plans.USERS_SENTRYY
  )
}

export const shouldDisplayTeamCard = ({
  plans,
}: {
  plans?: IndividualPlan[] | null
}) => {
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
