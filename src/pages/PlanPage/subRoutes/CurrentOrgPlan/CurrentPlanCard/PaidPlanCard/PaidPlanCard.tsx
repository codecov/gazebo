import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'
import { useAccountDetails, usePlanData } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import { isTeamPlan } from 'shared/utils/billing'

import ActionsBilling from '../shared/ActionsBilling/ActionsBilling'
import PlanPricing from '../shared/PlanPricing'

type URLParams = {
  provider: string
  owner: string
}

function PaidPlanCard() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const { data: ownerData } = usePlanPageData({ owner, provider })

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const plan = planData?.plan
  const marketingName = plan?.marketingName
  const benefits = plan?.benefits
  const value = plan?.value
  const baseUnitPrice = plan?.baseUnitPrice
  const seats = plan?.planUserCount
  const numberOfUploads = ownerData?.numberOfUploads

  return (
    <div className="flex flex-col border">
      <div className="p-4">
        <h2 className="font-semibold">{marketingName} plan</h2>
        <span className="text-gray-500">Current plan</span>
      </div>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={benefits ?? []}
            iconName="check"
            iconColor="text-ds-pink-quinary"
          />
        </div>
        <div className="flex flex-col gap-3 border-t pt-2 sm:border-0 sm:p-0">
          <p className="text-xs font-semibold">Pricing</p>
          <div>
            {value && baseUnitPrice ? (
              <PlanPricing value={value} baseUnitPrice={baseUnitPrice} />
            ) : null}
            {seats ? (
              <p className="text-xs text-ds-gray-senary">
                plan has {seats} seats
              </p>
            ) : null}
          </div>
          <ActionsBilling />
          {scheduledPhase ? (
            <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
          ) : null}
          {isNumber(numberOfUploads) && isTeamPlan(plan?.value) ? (
            <p className="text-xs text-ds-gray-senary">
              {numberOfUploads} of {planData?.plan?.monthlyUploadLimit} uploads
              in the last 30 days
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default PaidPlanCard
