import { metrics } from '@sentry/react'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { useUser } from 'services/user'
import { isFreePlan, isProPlan, isTeamPlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import { NewPlanType } from '../constants'

const TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.team.seats.change'
const PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.pro.seats.change'
const BILLING_PAGE_VISIT_METRIC_KEY = 'billing_change.user.visited.page'
const BILLING_PAGE_CHECKOUT_METRIC_KEY =
  'billing_change.user.checkout.from.page'

interface BillingControlsProps {
  seats: number
  isValid: boolean
  newPlan: NewPlanType
}

const UpdateButton: React.FC<BillingControlsProps> = ({
  isValid,
  newPlan,
  seats,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })

  const currentPlanValue = accountDetails?.plan?.value
  const currentPlanQuantity = accountDetails?.plan?.quantity

  const isSamePlan = newPlan === currentPlanValue
  const noChangeInSeats = seats === currentPlanQuantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats)
  const { data: currentUser } = useUser()
  const ownerId = currentUser?.trackingMetadata?.ownerid ?? 'No owner id'

  useEffect(() => {
    metrics.increment(BILLING_PAGE_VISIT_METRIC_KEY)
  }, [])

  const updateGaugeMetric = (planTypeKey: string, value: number) => {
    metrics.gauge(planTypeKey, value, {
      tags: {
        ownerId,
      },
    })
  }

  const updateBillingMetrics = () => {
    const seatDelta = seats - currentPlanQuantity
    if (isTeamPlan(currentPlanValue) && isProPlan(newPlan)) {
      updateGaugeMetric(
        TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        currentPlanQuantity * -1
      )
      updateGaugeMetric(PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seats)
    }

    if (isProPlan(currentPlanValue) && isTeamPlan(newPlan)) {
      updateGaugeMetric(TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seats)
      updateGaugeMetric(
        PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        currentPlanQuantity * -1
      )
    }

    if (isSamePlan && isTeamPlan(newPlan)) {
      updateGaugeMetric(TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seatDelta)
    }

    if (isSamePlan && isProPlan(newPlan)) {
      updateGaugeMetric(PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY, seatDelta)
    }

    metrics.increment(BILLING_PAGE_CHECKOUT_METRIC_KEY)
  }

  return (
    <div className="inline-flex">
      <Button
        data-cy="plan-page-plan-update"
        disabled={disabled}
        type="submit"
        variant="primary"
        hook="submit-upgrade"
        to={undefined}
        onClick={updateBillingMetrics}
      >
        {isFreePlan(currentPlanValue) ? 'Proceed to Checkout' : 'Update'}
      </Button>
    </div>
  )
}

export default UpdateButton
