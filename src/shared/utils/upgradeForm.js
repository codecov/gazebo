/* eslint-disable camelcase */
import { z } from 'zod'

import { isPaidPlan, isSentryPlan } from 'shared/utils/billing'

export const MIN_NB_SEATS = 2
export const MIN_SENTRY_SEATS = 5
export const SENTRY_PRICE = 29

export const getInitialDataForm = ({
  accountDetails,
  proPlanYear,
  sentryPlanYear,
  isSentryUpgrade,
  minSeats,
}) => {
  const currentPlan = accountDetails?.plan
  const currentNbSeats = currentPlan?.quantity ?? minSeats

  // get the number of seats of the current plan, but minimum x seats
  const seats = Math.max(currentNbSeats, minSeats)

  // if the current plan is a pro plan, we return it, otherwise select by default the first pro plan
  let newPlan = proPlanYear?.value
  if (isSentryUpgrade && !isSentryPlan(currentPlan?.value)) {
    newPlan = sentryPlanYear?.value
  } else if (isPaidPlan(currentPlan?.value)) {
    newPlan = currentPlan?.value
  }

  return {
    newPlan,
    seats,
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
