import { metrics } from '@sentry/react'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { isFreePlan, isProPlan, isTeamPlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import { NewPlanType } from '../constants'

const TEAM_TO_PRO_UPGRADE_WITH_SEAT_DELTA_METRIC_KEY =
  'billing_change.user.team.change.to.pro.test'
const PRO_TO_TEAM_CHANGE_WITH_SEAT_DELTA_METRIC_KEY =
  'billing_change.user.pro.change.to.team.test'
const NEW_PRO_SEATS_ADDED_METRIC_KEY = 'billing_change.user.new.pro.seats.test'
const NEW_TEAM_SEATS_ADDED_METRIC_KEY =
  'billing_change.user.new.team.seats.test'

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
  const seatDelta = seats - currentPlanQuantity

  const updateBillingMetrics = () => {
    if (isTeamPlan(currentPlanValue) && isProPlan(newPlan)) {
      metrics.distribution(
        TEAM_TO_PRO_UPGRADE_WITH_SEAT_DELTA_METRIC_KEY,
        seatDelta
      )
    }

    if (isProPlan(currentPlanValue) && isTeamPlan(newPlan)) {
      metrics.distribution(
        PRO_TO_TEAM_CHANGE_WITH_SEAT_DELTA_METRIC_KEY,
        seatDelta
      )
    }

    if (isSamePlan && isProPlan(newPlan)) {
      metrics.distribution(NEW_PRO_SEATS_ADDED_METRIC_KEY, seatDelta)
    }

    if (isSamePlan && isTeamPlan(newPlan)) {
      metrics.distribution(NEW_TEAM_SEATS_ADDED_METRIC_KEY, seatDelta)
    }
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
