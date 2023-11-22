import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account'
import {
  findTeamPlans,
  isAnnualPlan,
  isMonthlyPlan,
  isTeamPlan,
  useProPlans,
} from 'shared/utils/billing'
import OptionButton from 'ui/OptionButton'

interface BillingControlsProps {
  planString: string
  setValue: (x: string, y: string) => void
}

const BillingControls: React.FC<BillingControlsProps> = ({
  planString,
  setValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({ plans })

  const [option, setOption] = useState<'Annual' | 'Monthly'>(() =>
    isMonthlyPlan(planString) ? 'Monthly' : 'Annual'
  )

  // used to update option selection if user selects
  // the switch to annual button in the total banner
  useEffect(() => {
    if (isMonthlyPlan(planString) && option === 'Annual') {
      setOption('Monthly')
    } else if (isAnnualPlan(planString) && option === 'Monthly') {
      setOption('Annual')
    }
  }, [planString, option])

  let annualPlan = proPlanYear
  let monthlyPlan = proPlanMonth

  if (isTeamPlan(planString)) {
    annualPlan = teamPlanYear
    monthlyPlan = teamPlanMonth
  }

  const baseUnitPrice =
    option === 'Monthly'
      ? monthlyPlan?.baseUnitPrice
      : annualPlan?.baseUnitPrice
  const billingRate =
    option === 'Monthly' ? monthlyPlan?.billingRate : annualPlan?.billingRate

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Billing</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === 'Annual') {
              setValue('newPlan', annualPlan?.value)
            } else {
              setValue('newPlan', monthlyPlan?.value)
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
