import isNumber from 'lodash/isNumber'
import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'
import { planPropType, usePlans } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import {
  canApplySentryUpgrade,
  findSentryPlans,
  useProPlans,
} from 'shared/utils/billing'
import A from 'ui/A'

import ActionsBilling from '../shared/ActionsBilling/ActionsBilling'
import PlanPricing from '../shared/PlanPricing'
import ScheduledPlanDetails from '../shared/ScheduledPlanDetails'

function PlanUpgrade({ upgradeToPlan }) {
  return (
    <div className="flex flex-col border">
      <h2 className="p-4 font-semibold">{upgradeToPlan?.marketingName} plan</h2>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={upgradeToPlan?.benefits}
            iconName="check"
            iconColor="text-ds-pink-quinary"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="border-t pt-2 text-xs font-semibold sm:border-0 sm:p-0">
            Pricing
          </p>
          <div className="text-xs">
            <p className="font-semibold">
              <span className="text-2xl">${upgradeToPlan?.baseUnitPrice}</span>
              /per user, per month
            </p>
            <p className="text-ds-gray-senary">
              billed annually, or ${upgradeToPlan?.baseUnitPrice} per user
              billing monthly
            </p>
          </div>
          <ActionsBilling />
        </div>
      </div>
    </div>
  )
}

PlanUpgrade.propTypes = {
  upgradeToPlan: planPropType,
}

function FreePlanCard({ plan, scheduledPhase }) {
  const { provider } = useParams()

  const { data: ownerData } = usePlanPageData()
  const uploadsNumber =
    isNumber(ownerData?.numberOfUploads) && ownerData?.numberOfUploads

  const { data: plans } = usePlans(provider)
  const { proPlanMonth } = useProPlans({ plans })
  const { sentryPlanMonth } = findSentryPlans({ plans })
  const upgradeToPlan = canApplySentryUpgrade({ plan, plans })
    ? sentryPlanMonth
    : proPlanMonth

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col border">
        <div className="p-4">
          <h2 className="font-semibold">{plan?.marketingName} plan</h2>
          <span className="text-gray-500">Current Plan</span>
        </div>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={plan?.benefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </div>
          <div className="flex flex-col gap-3 border-t pt-2 sm:border-0 sm:p-0">
            <p className="text-xs font-semibold">Pricing</p>
            <PlanPricing
              value={plan?.value}
              baseUnitPrice={plan?.baseUnitPrice}
            />
            <div>
              {uploadsNumber && (
                <p className="mt-4 text-xs text-ds-gray-senary">
                  {uploadsNumber} of 250 uploads in the last 30 days
                </p>
              )}
              {scheduledPhase && (
                <ScheduledPlanDetails scheduledPhase={scheduledPhase} />
              )}
            </div>
          </div>
        </div>
      </div>
      <PlanUpgrade upgradeToPlan={upgradeToPlan} />
      <div className="text-xs">
        <A to={{ pageName: 'sales' }}>Contact sales</A> to discuss custom
        Enterprise plans
      </div>
    </div>
  )
}

FreePlanCard.propTypes = {
  plan: planPropType,
  scheduledPhase: PropType.shape({
    quantity: PropType.number.isRequired,
    plan: PropType.string.isRequired,
    startDate: PropType.number.isRequired,
  }),
}

export default FreePlanCard
