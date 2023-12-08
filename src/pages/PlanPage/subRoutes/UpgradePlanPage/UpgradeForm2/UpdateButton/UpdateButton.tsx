import React from 'react'
import { useParams } from 'react-router-dom'

import { useAccountDetails } from 'services/account'
import { isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

import { NewPlanType } from '../PlanTypeOptions/PlanTypeOptions'

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
        {isFreePlan(currentPlanValue) ? 'Proceed to Checkout' : 'Update'}
      </Button>
    </div>
  )
}

export default UpdateButton
