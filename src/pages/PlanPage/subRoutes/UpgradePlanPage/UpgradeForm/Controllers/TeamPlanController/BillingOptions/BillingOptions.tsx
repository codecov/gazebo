import { useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { BillingRate, findTeamPlans } from 'shared/utils/billing'
import { RadioTileGroup } from 'ui/RadioTileGroup'

import { OptionPeriod, TimePeriods } from '../../../constants'
import { UpgradeFormFields } from '../../../UpgradeForm'

interface BillingControlsProps {
  newPlan?: IndividualPlan
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (plan?: IndividualPlan) => void
}

const BillingControls: React.FC<BillingControlsProps> = ({
  newPlan,
  setFormValue,
  setSelectedPlan,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })
  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const currentPlanBillingRate = planData?.plan?.billingRate
  // Use newPlan's billing rate if available (preserves selection when switching plan types)
  // Fall back to current plan's billing rate for initial default
  const initialBillingRate = newPlan?.billingRate ?? currentPlanBillingRate
  const [option, setOption] = useState<OptionPeriod>(() =>
    initialBillingRate === BillingRate.MONTHLY
      ? TimePeriods.MONTHLY
      : TimePeriods.ANNUAL
  )

  const baseUnitPrice =
    option === TimePeriods.MONTHLY
      ? teamPlanMonth?.baseUnitPrice
      : teamPlanYear?.baseUnitPrice
  const billingRate =
    option === TimePeriods.MONTHLY
      ? teamPlanMonth?.billingRate
      : teamPlanYear?.billingRate

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Step 2: Choose a billing cycle</h3>
      <div className="inline-flex items-center gap-2">
        <RadioTileGroup
          value={option}
          onValueChange={(value: OptionPeriod) => {
            if (value === TimePeriods.ANNUAL) {
              setFormValue('newPlan', teamPlanYear)
              setSelectedPlan(teamPlanYear)
            } else {
              setFormValue('newPlan', teamPlanMonth)
              setSelectedPlan(teamPlanMonth)
            }

            setOption(value)
          }}
        >
          {currentPlanBillingRate === BillingRate.ANNUALLY && (
            <RadioTileGroup.Item
              value={TimePeriods.ANNUAL}
              className="w-32"
              data-testid="radio-annual"
            >
              <RadioTileGroup.Label>{TimePeriods.ANNUAL}</RadioTileGroup.Label>
            </RadioTileGroup.Item>
          )}
          <RadioTileGroup.Item
            value={TimePeriods.MONTHLY}
            className="w-32"
            data-testid="radio-monthly"
          >
            <RadioTileGroup.Label>{TimePeriods.MONTHLY}</RadioTileGroup.Label>
          </RadioTileGroup.Item>
        </RadioTileGroup>
        <p>
          <span className="font-semibold">${baseUnitPrice}</span> per
          seat/month, billed {billingRate}
        </p>
      </div>
    </div>
  )
}

export default BillingControls
