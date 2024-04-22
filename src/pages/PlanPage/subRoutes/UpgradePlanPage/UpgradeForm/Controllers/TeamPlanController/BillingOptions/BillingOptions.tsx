import { useEffect, useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAvailablePlans, usePlanData } from 'services/account'
import {
  findTeamPlans,
  isAnnualPlan,
  isMonthlyPlan,
  Plans,
} from 'shared/utils/billing'
import OptionButton from 'ui/OptionButton'

import { NewPlanType, OptionPeriod, TimePeriods } from '../../../constants'
import { UpgradeFormFields } from '../../../UpgradeForm'

interface BillingControlsProps {
  newPlan: NewPlanType
  setFormValue: UseFormSetValue<UpgradeFormFields>
}

const BillingControls: React.FC<BillingControlsProps> = ({
  newPlan,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })
  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const currentPlanBillingRate = planData?.plan?.billingRate
  const [option, setOption] = useState<OptionPeriod>(() =>
    currentPlanBillingRate === 'monthly'
      ? TimePeriods.MONTHLY
      : TimePeriods.ANNUAL
  )

  // used to update option selection if user selects
  // the switch to annual button in the total banner
  useEffect(() => {
    if (isMonthlyPlan(newPlan) && option === TimePeriods.ANNUAL) {
      setOption(TimePeriods.MONTHLY)
    } else if (isAnnualPlan(newPlan) && option === TimePeriods.MONTHLY) {
      setOption(TimePeriods.ANNUAL)
    }
  }, [newPlan, option])

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
      <h3 className="font-semibold">Choose a billing cycle</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === TimePeriods.ANNUAL) {
              setFormValue('newPlan', Plans.USERS_TEAMY)
            } else {
              setFormValue('newPlan', Plans.USERS_TEAMM)
            }

            setOption(text)
          }}
          options={[
            {
              text: TimePeriods.ANNUAL,
            },
            {
              text: TimePeriods.MONTHLY,
            },
          ]}
        />
        <p>
          <span className="font-semibold">${baseUnitPrice}</span> per
          seat/month, billed {billingRate}
        </p>
      </div>
    </div>
  )
}

export default BillingControls
