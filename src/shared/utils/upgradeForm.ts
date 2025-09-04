/* eslint-disable camelcase */
import { z } from 'zod'

import { AccountDetailsSchema } from 'services/account/useAccountDetails'
import { IndividualPlan } from 'services/account/useAvailablePlans'
import { Plan, TrialStatus, TrialStatuses } from 'services/account/usePlanData'
import {
  BillingRate,
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
} from 'shared/utils/billing'

export const MIN_NB_SEATS_PRO = 2
export const MIN_SENTRY_SEATS = 5
export const SENTRY_PRICE = 29
export const TEAM_PLAN_MAX_ACTIVE_USERS = 10

export const UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE = `Team plan is only available for ${TEAM_PLAN_MAX_ACTIVE_USERS} paid seats or fewer.`

export function extractSeats({
  quantity,
  activatedUserCount = 0,
  inactiveUserCount = 0,
  isSentryUpgrade,
  trialStatus,
  isFreePlan,
  isTrialPlan,
}: {
  quantity: number
  activatedUserCount?: number
  inactiveUserCount?: number
  isSentryUpgrade: boolean
  trialStatus?: TrialStatus
  isFreePlan?: boolean
  isTrialPlan?: boolean
}) {
  const totalMembers = inactiveUserCount + activatedUserCount
  const minPlansSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS_PRO
  const freePlanSeats = Math.max(minPlansSeats, totalMembers)
  const paidPlansSeats = Math.max(minPlansSeats, quantity)

  // if their on trial their seat count is around 1000 so this resets the
  // value to the minium value they would be going on if sentry or pro
  if (trialStatus === TrialStatuses.ONGOING && isTrialPlan) {
    return minPlansSeats
  }

  return isFreePlan ? freePlanSeats : paidPlansSeats
}

export const getSchema = ({
  accountDetails,
  minSeats = 1,
  trialStatus,
  selectedPlan,
  plan,
}: {
  accountDetails?: z.infer<typeof AccountDetailsSchema>
  minSeats?: number
  trialStatus?: TrialStatus
  selectedPlan?: IndividualPlan
  plan?: Plan | null
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
        if (selectedPlan?.isTeamPlan && val > TEAM_PLAN_MAX_ACTIVE_USERS) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE,
          })
        }

        if (trialStatus === TrialStatuses.ONGOING && plan?.isTrialPlan) {
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
  plan: Plan | null
  trialStatus: TrialStatus
}) {
  // cant cancel a free plan
  if (plan?.isFreePlan) {
    return false
  }

  // if user is on trial can't cancel plan
  if (plan?.isTrialPlan && trialStatus === TrialStatuses.ONGOING) {
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
  plan,
}: {
  accountDetails?: z.infer<typeof AccountDetailsSchema> | null
  plans?: IndividualPlan[] | null
  trialStatus?: TrialStatus
  selectedPlan?: IndividualPlan | null
  plan?: Plan | null
}) => {
  const activatedUserCount = accountDetails?.activatedUserCount
  const inactiveUserCount = accountDetails?.inactiveUserCount

  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({ plans })

  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: plan?.isEnterprisePlan,
    plans,
  })

  const isMonthlyPlan = plan?.billingRate === BillingRate.MONTHLY

  const isPaidPlan = !!plan?.billingRate // If the plan has a billing rate, it's a paid plan

  let newPlan = proPlanYear
  if (isSentryUpgrade && !plan?.isSentryPlan) {
    newPlan = isMonthlyPlan ? sentryPlanMonth : sentryPlanYear
  } else if (plan?.isTeamPlan || selectedPlan?.isTeamPlan) {
    newPlan = isMonthlyPlan ? teamPlanMonth : teamPlanYear
  } else if (isPaidPlan) {
    newPlan = plan
  }

  const seats = extractSeats({
    // free seats are included in planUserCount but we want to use the paid number
    quantity: plan?.planUserCount
      ? plan?.planUserCount - (plan?.freeSeatCount ?? 0)
      : 0,
    activatedUserCount,
    inactiveUserCount,
    trialStatus,
    isSentryUpgrade,
    isFreePlan: plan?.isFreePlan,
    isTrialPlan: plan?.isTrialPlan,
  })

  return {
    newPlan,
    seats,
  }
}
