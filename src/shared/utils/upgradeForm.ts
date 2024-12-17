/* eslint-disable camelcase */
import { z } from 'zod'

import {
  AccountDetailsSchema,
  TrialStatus,
  TrialStatuses,
} from 'services/account'
import {
  BillingRate,
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  isFreePlan,
  isSentryPlan,
  isTeamPlan,
  isTrialPlan,
  Plan,
  PlanName,
  Plans,
} from 'shared/utils/billing'

export const MIN_NB_SEATS_PRO = 2
export const MIN_SENTRY_SEATS = 5
export const SENTRY_PRICE = 29
export const TEAM_PLAN_MAX_ACTIVE_USERS = 10

export const UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE = `Team plan is only available for ${TEAM_PLAN_MAX_ACTIVE_USERS} seats or fewer.`

export function extractSeats({
  quantity,
  value,
  activatedUserCount = 0,
  inactiveUserCount = 0,
  isSentryUpgrade,
  trialStatus,
}: {
  quantity: number
  value?: PlanName
  activatedUserCount?: number
  inactiveUserCount?: number
  isSentryUpgrade: boolean
  trialStatus?: TrialStatus
}) {
  const totalMembers = inactiveUserCount + activatedUserCount
  const minPlansSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS_PRO
  const freePlanSeats = Math.max(minPlansSeats, totalMembers)
  const paidPlansSeats = Math.max(minPlansSeats, quantity)

  // if their on trial their seat count is around 1000 so this resets the
  // value to the minium value they would be going on if sentry or pro
  if (trialStatus === TrialStatuses.ONGOING && value === Plans.USERS_TRIAL) {
    return minPlansSeats
  }

  return isFreePlan(value) ? freePlanSeats : paidPlansSeats
}

export const getSchema = ({
  accountDetails,
  minSeats = 1,
  trialStatus,
  selectedPlan,
}: {
  accountDetails?: z.infer<typeof AccountDetailsSchema>
  minSeats?: number
  trialStatus?: TrialStatus
  selectedPlan?: Plan
}) =>
  z.object({
    seats: z.coerce
      .number({
        required_error: 'Number of seats is required',
        invalid_type_error: 'Seats is required to be a number',
      })
      .int()
      .min(minSeats, {
        message: `You cannot purchase a per user plan for less than ${minSeats} users`,
      })
      .transform((val, ctx) => {
        if (
          isTeamPlan(selectedPlan?.value) &&
          val > TEAM_PLAN_MAX_ACTIVE_USERS
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE,
          })
        }

        if (
          trialStatus === TrialStatuses.ONGOING &&
          accountDetails?.plan?.value === Plans.USERS_TRIAL
        ) {
          return val
        }

        if (val < (accountDetails?.activatedUserCount ?? 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must deactivate more users before downgrading plans',
          })
        }

        return val
      }),
    newPlan: z.object({
      value: z.string(),
    }),
  })

export const calculatePrice = ({
  seats,
  baseUnitPrice,
  isSentryUpgrade,
  sentryPrice,
  isSelectedPlanTeam,
}: {
  seats: number
  baseUnitPrice: number
  isSentryUpgrade: boolean
  sentryPrice: number
  isSelectedPlanTeam: boolean
}) => {
  let price = Math.floor(seats) * baseUnitPrice

  if (isSentryUpgrade && !isSelectedPlanTeam) {
    price = sentryPrice
    if (seats > 5) {
      price += Math.floor(seats - 5) * baseUnitPrice
    }
  }

  return price
}

export function shouldRenderCancelLink({
  cancelAtPeriodEnd,
  plan,
  trialStatus,
}: {
  cancelAtPeriodEnd: boolean
  plan: Plan
  trialStatus: TrialStatus
}) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value)) {
    return false
  }

  // if user is on trial can't cancel plan
  if (isTrialPlan(plan?.value) && trialStatus === TrialStatuses.ONGOING) {
    return false
  }

  // plan is already set for cancellation
  if (cancelAtPeriodEnd) {
    return false
  }

  return true
}

// Pro Plan Utils
export const calculatePriceProPlan = ({
  seats,
  baseUnitPrice = 0,
}: {
  seats: number
  baseUnitPrice?: number
}) => {
  return Math.floor(seats) * baseUnitPrice
}

// Team Plan Utils
export const calculatePriceTeamPlan = ({
  seats,
  baseUnitPrice = 0,
}: {
  seats: number
  baseUnitPrice?: number
}) => {
  return Math.floor(seats) * baseUnitPrice
}

// Sentry Plan Utils
export const calculatePriceSentryPlan = ({
  seats,
  baseUnitPrice = 0,
}: {
  seats: number
  baseUnitPrice?: number
}) => {
  let price = SENTRY_PRICE

  if (seats > 5) {
    price += Math.floor(seats - 5) * baseUnitPrice
  }

  return price
}

export const calculateSentryNonBundledCost = ({
  baseUnitPrice = 0,
}: {
  baseUnitPrice?: number
}) => MIN_SENTRY_SEATS * baseUnitPrice * 12 - SENTRY_PRICE * 12

export const getDefaultValuesUpgradeForm = ({
  accountDetails,
  plans,
  trialStatus,
  selectedPlan,
  isEnterprisePlan,
}: {
  accountDetails?: z.infer<typeof AccountDetailsSchema> | null
  plans?: Plan[] | null
  trialStatus?: TrialStatus
  selectedPlan?: Plan
  isEnterprisePlan?: boolean
}) => {
  const currentPlan = accountDetails?.plan
  const quantity = currentPlan?.quantity ?? 0
  const activatedUserCount = accountDetails?.activatedUserCount
  const inactiveUserCount = accountDetails?.inactiveUserCount

  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({ plans })

  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan,
    plans,
  })

  const isMonthlyPlan =
    accountDetails?.plan?.billingRate === BillingRate.MONTHLY
  const isPaidPlan = !!accountDetails?.plan?.billingRate // If the plan has a billing rate, it's a paid plan

  let newPlan = proPlanYear
  if (isSentryUpgrade && !isSentryPlan(currentPlan?.value)) {
    newPlan = isMonthlyPlan ? sentryPlanMonth : sentryPlanYear
  } else if (
    isTeamPlan(currentPlan?.value) ||
    isTeamPlan(selectedPlan?.value)
  ) {
    newPlan = isMonthlyPlan ? teamPlanMonth : teamPlanYear
  } else if (isPaidPlan) {
    newPlan = currentPlan!
  }

  const seats = extractSeats({
    value: currentPlan?.value,
    quantity,
    activatedUserCount,
    inactiveUserCount,
    trialStatus,
    isSentryUpgrade,
  })

  return {
    newPlan,
    seats,
  }
}
