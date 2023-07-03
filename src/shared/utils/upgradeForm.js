/* eslint-disable camelcase */
import { z } from 'zod'

import { isFreePlan, isPaidPlan, isSentryPlan } from 'shared/utils/billing'

export const MIN_NB_SEATS = 2
export const MIN_SENTRY_SEATS = 5
export const SENTRY_PRICE = 29

export function extractSeats({ currentPlan, totalMembers, isSentryUpgrade }) {
  const minPlansSeats = isSentryUpgrade ? MIN_SENTRY_SEATS : MIN_NB_SEATS
  const freePlanMinSeats = Math.max(minPlansSeats, totalMembers || 0)
  const currentPlanSeats = currentPlan?.quantity ?? 0

  const seats = isFreePlan(currentPlan?.value)
    ? freePlanMinSeats
    : Math.max(currentPlanSeats, minPlansSeats)

  return seats
}

export const getInitialDataForm = ({
  accountDetails,
  proPlanYear,
  sentryPlanYear,
  isSentryUpgrade,
}) => {
  const currentPlan = accountDetails?.plan
  const plan = currentPlan?.value

  // if the current plan is a pro plan, we return it, otherwise select by default the first pro plan
  let newPlan = proPlanYear?.value
  if (isSentryUpgrade && !isSentryPlan(plan)) {
    newPlan = sentryPlanYear?.value
  } else if (isPaidPlan(plan)) {
    newPlan = plan
  }

  return {
    newPlan,
    seats: extractSeats({
      currentPlan,
      totalMembers:
        accountDetails?.activatedUserCount + accountDetails?.inactiveUserCount,
      isSentryUpgrade,
    }),
  }
}

export const getSchema = ({ accountDetails, minSeats }) =>
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
}) => {
  let price = Math.floor(seats) * baseUnitPrice

  if (isSentryUpgrade) {
    price = sentryPrice
    if (seats > 5) {
      price += Math.floor(seats - 5) * baseUnitPrice
    }
  }

  return price
}

export const calculateNonBundledCost = ({ baseUnitPrice }) =>
  MIN_SENTRY_SEATS * baseUnitPrice * 12 - SENTRY_PRICE * 12

export function shouldRenderCancelLink(accountDetails, plan) {
  // cant cancel a free plan
  if (isFreePlan(plan?.value)) return false

  // plan is already set for cancellation
  if (accountDetails?.subscriptionDetail?.cancelAtPeriodEnd) return false

  return true
}
