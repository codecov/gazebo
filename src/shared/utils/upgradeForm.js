/* eslint-disable camelcase */
import { z } from 'zod'

import { TrialStatuses } from 'services/account'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  isFreePlan,
  isPaidPlan,
  isSentryPlan,
  isTeamPlan,
  isTrialPlan,
  Plans,
} from 'shared/utils/billing'

// TODO: delete when whole form control is done
export const MIN_NB_SEATS = 2

export const MIN_NB_SEATS_PRO = 2
export const MIN_SENTRY_SEATS = 5
export const SENTRY_PRICE = 29
export const TEAM_PLAN_MAX_ACTIVE_USERS = 10

export function extractSeats({
  quantity,
  value,
  activatedUserCount,
  inactiveUserCount,
  isSentryUpgrade,
  trialStatus,
}) {
  const totalMembers = (inactiveUserCount ?? 0) + (activatedUserCount ?? 0)
  const minPlansSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS
  const freePlanSeats = Math.max(minPlansSeats, totalMembers)
  const paidPlansSeats = Math.max(minPlansSeats, quantity)

  // if their on trial their seat count is around 1000 so this resets the
  // value to the minium value they would be going on if sentry or pro
  if (trialStatus === TrialStatuses.ONGOING && value === Plans.USERS_TRIAL) {
    return minPlansSeats
  }

  return isFreePlan(value) ? freePlanSeats : paidPlansSeats
}

// TODO: Get rid of this after the final refactor in favor of Controls specific utils
export const getInitialDataForm = ({
  accountDetails,
  proPlanYear,
  sentryPlanYear,
  isSentryUpgrade,
  trialStatus,
}) => {
  const currentPlan = accountDetails?.plan
  const plan = currentPlan?.value

  // if the current plan is a pro plan, we return it, otherwise select by default the first pro plan
  let newPlan = proPlanYear?.value

  if (isSentryUpgrade && !isSentryPlan(plan)) {
    newPlan = sentryPlanYear?.value
  } else if (isTeamPlan(plan)) {
    newPlan = proPlanYear?.value
  } else if (isPaidPlan(plan)) {
    newPlan = plan
  }

  return {
    newPlan,
    seats: extractSeats({
      quantity: currentPlan?.quantity ?? 0,
      value: plan,
      activatedUserCount: accountDetails?.activatedUserCount,
      inactiveUserCount: accountDetails?.inactiveUserCount,
      isSentryUpgrade,
      trialStatus,
    }),
  }
}

export const getSchema = ({
  accountDetails,
  minSeats,
  trialStatus,
  selectedPlan,
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
            message: `Team plan is only available for ${TEAM_PLAN_MAX_ACTIVE_USERS} or less users`,
          })
        }

        if (
          trialStatus === TrialStatuses.ONGOING &&
          accountDetails?.plan?.value === Plans.USERS_TRIAL
        ) {
          return val
        }

        if (val < accountDetails?.activatedUserCount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must deactivate more users before downgrading plans',
          })
        }

        return val
      }),
    newPlan: z.string({
      required_error: 'Plan type is required',
      invalid_type_error: 'Plan type is required to be a string',
    }),
  })

export const calculatePrice = ({
  seats,
  baseUnitPrice,
  isSentryUpgrade,
  sentryPrice,
  isSelectedPlanTeam,
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

export const calculateNonBundledCost = ({ baseUnitPrice }) =>
  MIN_SENTRY_SEATS * baseUnitPrice * 12 - SENTRY_PRICE * 12

export function shouldRenderCancelLink(cancelAtPeriodEnd, plan, trialStatus) {
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
export const calculatePriceProPlan = ({ seats, baseUnitPrice }) => {
  return Math.floor(seats) * baseUnitPrice
}

// Team Plan Utils
export const calculatePriceTeamPlan = ({ seats, baseUnitPrice }) => {
  return Math.floor(seats) * baseUnitPrice
}

export const getDefaultValuesUpgradeForm = ({
  accountDetails,
  plans,
  trialStatus,
}) => {
  const currentPlan = accountDetails?.plan
  const currentPlanValue = currentPlan?.value
  const quantity = currentPlan?.quantity ?? 0
  const activatedUserCount = accountDetails?.activatedUserCount
  const inactiveUserCount = accountDetails?.inactiveUserCount

  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const isSentryUpgrade = canApplySentryUpgrade({
    plan: currentPlanValue,
    plans,
  })

  // if the current plan is a pro plan, we return it, otherwise select by default the first pro plan
  let newPlan = proPlanYear?.value

  if (isSentryUpgrade && !isSentryPlan(currentPlanValue)) {
    newPlan = sentryPlanYear?.value
  } else if (isTeamPlan(currentPlanValue)) {
    newPlan = proPlanYear?.value
  } else if (isPaidPlan(currentPlanValue)) {
    newPlan = currentPlanValue
  }

  const seats = extractSeats({
    value: currentPlanValue,
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
