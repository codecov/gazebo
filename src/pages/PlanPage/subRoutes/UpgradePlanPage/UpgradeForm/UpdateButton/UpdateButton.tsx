import { metrics } from '@sentry/react'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { useUser } from 'services/user'
import { isFreePlan, isProPlan, isTeamPlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import { NewPlanType } from '../constants'

const TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.team.change.to.pro.test1'
const PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY =
  'billing_change.user.team.change.to.pro.test1'
const BILLING_PAGE_VISIT_METRIC_KEY =
  'billing_change.user.team.change.to.pro.test1'
const BILLING_PAGE_CHECKOUT_METRIC_KEY =
  'billing_change.user.team.change.to.pro.test1'

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
  const ownerId = currentUser.trackingMetadata.ownerid

  useEffect(() => {
    return () => {
      metrics.increment(BILLING_PAGE_VISIT_METRIC_KEY)
    }
  }, [])

  const updateGaugeMetric = (
    isPlanConditionMet: boolean,
    planTypeKey: string,
    value: number
  ) => {
    if (isPlanConditionMet) {
      metrics.gauge(planTypeKey, value, {
        tags: {
          ownerId,
        },
      })
    }
  }

  const updateBillingMetrics = () => {
    const seatDelta = seats - currentPlanQuantity
    if (!isSamePlan) {
      updateGaugeMetric(
        isTeamPlan(currentPlanValue),
        TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        currentPlanValue * -1
      )
      updateGaugeMetric(
        isProPlan(currentPlanValue),
        PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        currentPlanValue * -1
      )
    }

    if (isSamePlan) {
      updateGaugeMetric(
        isProPlan(newPlan),
        PRO_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        seatDelta
      )
      updateGaugeMetric(
        isTeamPlan(newPlan),
        TEAM_SEATS_ADDED_AND_REMOVED_METRIC_KEY,
        seatDelta
      )
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
        onClick={updateBillingMetrics()}
      >
        {isFreePlan(currentPlanValue) ? 'Proceed to Checkout' : 'Update'}
      </Button>
    </div>
  )
}

export default UpdateButton
