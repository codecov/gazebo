/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { PlanType, usePlans } from 'services/account'
import {
  findSentryPlans,
  isAnnualPlan,
  isMonthlyPlan,
  Plans,
  useProPlans,
} from 'shared/utils/billing'
import OptionButton from 'ui/OptionButton'

interface BillingTextProps {
  option: 'Annual' | 'Monthly'
  isSentryUpgrade: boolean
}

// eslint-disable-next-line max-statements
const BillingText: React.FC<BillingTextProps> = ({
  isSentryUpgrade,
  option,
}) => {
  const { provider } = useParams<{ provider: string }>()
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })

  let annualPlan = proPlanYear
  let monthlyPlan = proPlanMonth

  if (isSentryUpgrade) {
    annualPlan = sentryPlanYear
    monthlyPlan = sentryPlanMonth
  }

  let baseUnitPrice = annualPlan?.baseUnitPrice
  let billingRate = annualPlan?.billingRate

  if (option === 'Monthly') {
    baseUnitPrice = monthlyPlan?.baseUnitPrice
    billingRate = monthlyPlan?.billingRate
  }

  return (
    <p>
      <span className="font-semibold">${baseUnitPrice}</span>
      /per seat, billed {billingRate}
    </p>
  )
}

interface BillingControlsProps {
  planString: string
  setValue: (x: string, y: string) => void
  disableInputs: boolean
  isSentryUpgrade: boolean
}

const BillingControls: React.FC<BillingControlsProps> = ({
  planString,
  setValue,
  disableInputs,
  isSentryUpgrade,
}) => {
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

  let annualPlan: PlanType['value'] = Plans.USERS_PR_INAPPY
  let monthlyPlan: PlanType['value'] = Plans.USERS_PR_INAPPM

  if (isSentryUpgrade) {
    annualPlan = Plans.USERS_SENTRYY
    monthlyPlan = Plans.USERS_SENTRYM
  }

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Billing</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          disabled={disableInputs}
          onChange={({ text }) => {
            if (text === 'Annual') {
              setValue('newPlan', annualPlan)
            } else {
              setValue('newPlan', monthlyPlan)
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
        <BillingText isSentryUpgrade={isSentryUpgrade} option={option} />
      </div>
    </div>
  )
}

export default BillingControls
