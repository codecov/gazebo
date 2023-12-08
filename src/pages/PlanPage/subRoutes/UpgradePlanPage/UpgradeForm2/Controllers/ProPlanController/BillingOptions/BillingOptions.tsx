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

  const [option, setOption] = useState<'Annual' | 'Monthly'>(() =>
    isMonthlyPlan(newPlan) ? 'Monthly' : 'Annual'
  )

  // used to update option selection if user selects
  // the switch to annual button in the total banner
  useEffect(() => {
    if (isMonthlyPlan(newPlan) && option === 'Annual') {
      setOption('Monthly')
    } else if (isAnnualPlan(newPlan) && option === 'Monthly') {
      setOption('Annual')
    }
  }, [newPlan, option])

  const baseUnitPrice =
    option === 'Monthly'
      ? proPlanMonth?.baseUnitPrice
      : proPlanYear?.baseUnitPrice
  const billingRate =
    option === 'Monthly' ? proPlanMonth?.billingRate : proPlanYear?.billingRate

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Billing</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === 'Annual') {
              setFormValue('newPlan', Plans.USERS_PR_INAPPY)
            } else {
              setFormValue('newPlan', Plans.USERS_PR_INAPPM)
            }

            setOption(text)
          }}
          options={[
            {
              text: 'Annual',
            },
            {
              text: 'Monthly',
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
