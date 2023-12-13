import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account'
import {
  isAnnualPlan,
  isMonthlyPlan,
  Plans,
  useProPlans,
} from 'shared/utils/billing'
import OptionButton from 'ui/OptionButton'

import { NewPlanType } from '../../../PlanTypeOptions/PlanTypeOptions'
import { OptionPeriod, TimePeriods } from '../../constants'

interface BillingControlsProps {
  newPlan: NewPlanType
  setFormValue: (x: string, y: string) => void
}

const BillingControls: React.FC<BillingControlsProps> = ({
  newPlan,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })

  const [option, setOption] = useState<OptionPeriod>(() =>
    isMonthlyPlan(newPlan) ? TimePeriods.MONTHLY : TimePeriods.ANNUAL
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
      ? proPlanMonth?.baseUnitPrice
      : proPlanYear?.baseUnitPrice
  const billingRate =
    option === TimePeriods.MONTHLY
      ? proPlanMonth?.billingRate
      : proPlanYear?.billingRate

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Billing</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === TimePeriods.ANNUAL) {
              setFormValue('newPlan', Plans.USERS_PR_INAPPY)
            } else {
              setFormValue('newPlan', Plans.USERS_PR_INAPPM)
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
          <span className="font-semibold">${baseUnitPrice}</span>
          /per seat, billed {billingRate}
        </p>
      </div>
    </div>
  )
}

export default BillingControls
