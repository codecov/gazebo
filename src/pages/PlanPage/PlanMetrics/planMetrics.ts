import { metrics } from '@sentry/react'

import { isProPlan, isTeamPlan } from 'shared/utils/billing'

const TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.team.seats.change'
const PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.pro.seats.change'
const BILLING_PAGE_VISIT_METRIC_KEY = 'billing_change.user.visited.page'
const BILLING_PAGE_CHECKOUT_METRIC_KEY =
  'billing_change.user.checkout.from.page'

const updateGaugeMetric = (
  planTypeKey: string,
  value: number,
  ownerId: string
) => {
  metrics.gauge(planTypeKey, value, {
    tags: {
      ownerId,
    },
  })
}

// Updates metrics on the checkout page, which consists of plan + seat selection
export const updateBillingMetrics = (
  isSamePlan: boolean,
  seats: number,
  currentPlanValue: string,
  newPlan: String,
  currentPlanQuantity: number,
  ownerId: string
) => {
  const seatDelta = seats - currentPlanQuantity
  if (isTeamPlan(currentPlanValue) && isProPlan(newPlan)) {
    updateGaugeMetric(
      TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
      currentPlanQuantity * -1,
      ownerId
    )
    updateGaugeMetric(PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seats, ownerId)
  }

  if (isProPlan(currentPlanValue) && isTeamPlan(newPlan)) {
    updateGaugeMetric(TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seats, ownerId)
    updateGaugeMetric(
      PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
      currentPlanQuantity * -1,
      ownerId
    )
  }

  if (isSamePlan && isTeamPlan(newPlan)) {
    updateGaugeMetric(
      TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
      seatDelta,
      ownerId
    )
  }

  if (isSamePlan && isProPlan(newPlan)) {
    updateGaugeMetric(
      PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
      seatDelta,
      ownerId
    )
  }

  metrics.increment(BILLING_PAGE_CHECKOUT_METRIC_KEY)
}

export const incrementBillingPageVisitCounter = () => {
  metrics.increment(BILLING_PAGE_VISIT_METRIC_KEY)
}
