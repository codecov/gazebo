import { isProPlan, isTeamPlan } from 'shared/utils/billing'
import { metrics } from 'shared/utils/metrics'

// Updates metrics on the checkout page, which consists of plan + seat selection
export const updateBillingMetrics = (
  isSamePlan: boolean,
  seats: number,
  currentPlanValue: string,
  newPlan: String,
  currentPlanQuantity: number
) => {
  const seatDelta = seats - currentPlanQuantity
  if (isTeamPlan(currentPlanValue) && isProPlan(newPlan)) {
    metrics.gauge(
      'billing_change.user.seats_change',
      currentPlanQuantity * -1,
      { tags: { plan: 'team' } }
    )

    metrics.gauge('billing_change.user.seats_change', seats, {
      tags: { plan: 'pro' },
    })
  }

  if (isProPlan(currentPlanValue) && isTeamPlan(newPlan)) {
    metrics.gauge(
      'billing_change.user.seats_change',
      currentPlanQuantity * -1,
      { tags: { plan: 'pro' } }
    )

    metrics.gauge('billing_change.user.seats_change', seats, {
      tags: { plan: 'team' },
    })
  }

  if (isSamePlan && isTeamPlan(newPlan)) {
    metrics.gauge('billing_change.user.seats_change', seatDelta, {
      tags: { plan: 'team' },
    })
  }

  if (isSamePlan && isProPlan(newPlan)) {
    metrics.gauge('billing_change.user.seats_change', seatDelta, {
      tags: { plan: 'pro' },
    })
  }

  metrics.increment('billing_change.user.checkout_from_page')
}

export const incrementBillingPageVisitCounter = () => {
  metrics.increment('bundles_tab.bundle_details.visited_page')
}
