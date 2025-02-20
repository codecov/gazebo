import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import isNumber from 'lodash/isNumber'
import { useParams } from 'react-router-dom'

import { PlanPageDataQueryOpts } from 'pages/PlanPage/queries/PlanPageDataQueryOpts'
import { useAccountDetails } from 'services/account/useAccountDetails'
import { usePlanData } from 'services/account/usePlanData'
import { Provider } from 'shared/api/helpers'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'

import ActionsBilling from '../shared/ActionsBilling/ActionsBilling'
import PlanPricing from '../shared/PlanPricing'

type URLParams = {
  provider: Provider
  owner: string
}

function PaidPlanCard() {
  const { provider, owner } = useParams<URLParams>()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const { data: ownerData } = useSuspenseQueryV5(
    PlanPageDataQueryOpts({ owner, provider })
  )

  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase
  const plan = planData?.plan
  const marketingName = plan?.marketingName
  const benefits = plan?.benefits
  const baseUnitPrice = plan?.baseUnitPrice
  const seats = plan?.planUserCount
  const numberOfUploads = ownerData?.numberOfUploads

  return (
    <div className="flex flex-col border">
      <div className="flex justify-between p-4">
        <div>
          <h2 className="font-semibold">{marketingName} plan</h2>
          <span className="text-ds-gray-quinary">Current plan</span>
        </div>
        <ActionsBilling />
      </div>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0 sm:gap-y-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={benefits ?? []}
            iconName="check"
            iconColor="text-ds-pink-default"
          />
        </div>
        <div className="flex flex-col border-t pt-2 sm:border-0 sm:p-0">
          <p className="mb-2 text-xs font-semibold">Pricing</p>
          <div className="mb-4">
            {baseUnitPrice ? (
              <PlanPricing plan={plan} baseUnitPrice={baseUnitPrice} />
            ) : null}
            {seats ? (
              <p className="text-xs text-ds-gray-senary">
                plan has {seats} seats
              </p>
            ) : null}
          </div>
          {scheduledPhase ? (
            <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
          ) : null}
        </div>
        {isNumber(numberOfUploads) && plan?.isTeamPlan ? (
          <div>
            <p className="mb-2 text-xs font-semibold">Private repo uploads</p>
            <p className="text-xs text-ds-gray-senary">
              {numberOfUploads} of {planData?.plan?.monthlyUploadLimit} uploads
              in the last 30 days
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default PaidPlanCard
