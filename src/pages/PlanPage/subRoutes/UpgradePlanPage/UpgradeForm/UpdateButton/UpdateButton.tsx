import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  incrementBillingPageVisitCounter,
  updateBillingMetrics,
} from 'pages/PlanPage/PlanMetrics/planMetrics'
import { useAccountDetails } from 'services/account'
import { useUser } from 'services/user'
import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import { NewPlanType } from '../constants'

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
    incrementBillingPageVisitCounter()
  }, [])

  const sendBillingMetricsToSentry = () => {
    updateBillingMetrics(
      isSamePlan,
      seats,
      currentPlanValue,
      newPlan,
      currentPlanQuantity,
      ownerId
    )
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
        onClick={sendBillingMetricsToSentry}
      >
        {isFreePlan(currentPlanValue) ? 'Proceed to Checkout' : 'Update'}
      </Button>
    </div>
  )
}

export default UpdateButton
