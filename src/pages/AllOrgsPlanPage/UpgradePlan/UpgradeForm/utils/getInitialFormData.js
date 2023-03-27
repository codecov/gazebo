import { isPaidPlan } from 'shared/utils/billing'

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
  if (isSentryUpgrade) {
    newPlan = sentryPlanYear?.value
  } else if (isPaidPlan(currentPlan?.value)) {
    newPlan = currentPlan?.value
  }

  return {
    newPlan,
    seats,
  }
}
