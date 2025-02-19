import { useEffect, useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { BillingRate, findSentryPlans } from 'shared/utils/billing'
import OptionButton from 'ui/OptionButton'

import { OptionPeriod, TimePeriods } from '../../../constants'
import { UpgradeFormFields } from '../../../UpgradeForm'

interface BillingControlsProps {
  newPlan?: IndividualPlan
  setFormValue: UseFormSetValue<UpgradeFormFields>
}

const BillingControls: React.FC<BillingControlsProps> = ({
  newPlan,
  setFormValue,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const currentPlanBillingRate = planData?.plan?.billingRate

  const [option, setOption] = useState<OptionPeriod>(() =>
    currentPlanBillingRate === BillingRate.MONTHLY
      ? TimePeriods.MONTHLY
      : TimePeriods.ANNUAL
  )

  // used to update option selection if user selects
  // the switch to annual button in the total banner
  useEffect(() => {
    if (
      newPlan?.billingRate === BillingRate.MONTHLY &&
      option === TimePeriods.ANNUAL
    ) {
      setOption(TimePeriods.MONTHLY)
    } else if (
      newPlan?.billingRate === BillingRate.ANNUALLY &&
      option === TimePeriods.MONTHLY
    ) {
      setOption(TimePeriods.ANNUAL)
    }
  }, [newPlan, option])

  const baseUnitPrice =
    option === TimePeriods.MONTHLY
      ? sentryPlanMonth?.baseUnitPrice
      : sentryPlanYear?.baseUnitPrice
  const billingRate =
    option === TimePeriods.MONTHLY
      ? sentryPlanMonth?.billingRate
      : sentryPlanYear?.billingRate

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Choose a billing cycle</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === TimePeriods.ANNUAL) {
              setFormValue('newPlan', sentryPlanYear)
            } else {
              setFormValue('newPlan', sentryPlanMonth)
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
