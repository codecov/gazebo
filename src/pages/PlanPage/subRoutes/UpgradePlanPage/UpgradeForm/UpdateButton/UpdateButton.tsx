import React from 'react'
import { useParams } from 'react-router-dom'

import { usePlanData } from 'services/account'
import { Plan } from 'shared/utils/billing'
import Button from 'ui/Button'

interface BillingControlsProps {
  seats: number
  isValid: boolean
  newPlan?: Plan
}

const UpdateButton: React.FC<BillingControlsProps> = ({
  isValid,
  newPlan,
  seats,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: planData } = usePlanData({ provider, owner })

  const currentPlanValue = planData?.plan?.value
  const currentPlanQuantity = planData?.plan?.planUserCount || 0

  const isSamePlan = newPlan?.value === currentPlanValue
  const noChangeInSeats = seats === currentPlanQuantity
  const disabled = !isValid || (isSamePlan && noChangeInSeats)

  return (
    <div className="inline-flex">
      <Button
        data-cy="plan-page-plan-update"
        disabled={disabled}
        type="submit"
        variant="primary"
        hook="submit-upgrade"
        to={undefined}
      >
        {planData?.plan?.isFreePlan ? 'Proceed to checkout' : 'Update'}
      </Button>
    </div>
  )
}

export default UpdateButton
