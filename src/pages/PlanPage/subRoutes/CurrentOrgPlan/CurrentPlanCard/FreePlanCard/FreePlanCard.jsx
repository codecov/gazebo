import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import isNumber from 'lodash/isNumber'
import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { PlanPageDataQueryOpts } from 'pages/PlanPage/queries/PlanPageDataQueryOpts'
import { planPropType } from 'services/account/propTypes'
import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { TrialStatuses, usePlanData } from 'services/account/usePlanData'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import {
  canApplySentryUpgrade,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import A from 'ui/A'

import PlanUpgradePro from './PlanUpgradePro'
import PlanUpgradeTeam from './PlanUpgradeTeam'

import PlanPricing from '../shared/PlanPricing'

function FreePlanCard({ plan, scheduledPhase }) {
  const { provider, owner } = useParams()
  const { data: ownerData } = useSuspenseQueryV5(
    PlanPageDataQueryOpts({ owner, provider })
  )
  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const { data: plans } = useAvailablePlans({ provider, owner })

  const uploadsNumber = ownerData?.numberOfUploads
  const trialOngoing =
    planData?.plan?.isTrialPlan &&
    planData?.plan?.trialStatus === TrialStatuses.ONGOING

  let benefits = plan?.benefits
  let baseUnitPrice = plan?.baseUnitPrice
  let marketingName = plan?.marketingName

  if (trialOngoing) {
    benefits = planData?.pretrialPlan?.benefits
    baseUnitPrice = planData?.pretrialPlan?.baseUnitPrice
    marketingName = planData?.pretrialPlan?.marketingName
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col border">
        <div className="p-4">
          <h2 className="font-semibold">{marketingName} plan</h2>
          <span className="text-ds-gray-quinary">
            {trialOngoing
              ? "You'll be downgraded to the Developer plan when your trial expires."
              : 'Current plan'}
          </span>
        </div>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={benefits}
              iconName="check"
              iconColor="text-ds-pink-default"
            />
          </div>
          <div className="flex flex-col border-t pt-2 sm:border-0 sm:p-0">
            <p className="mb-2 text-xs font-semibold">Pricing</p>
            <div className="mb-4">
              <PlanPricing
                plan={planData?.plan}
                baseUnitPrice={baseUnitPrice}
              />
            </div>
            <div>
              {isNumber(uploadsNumber) && (
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
      {shouldDisplayTeamCard({ plans }) && <PlanUpgradeTeam />}
      <PlanUpgradePro
        isSentryUpgrade={canApplySentryUpgrade({
          isEnterprisePlan: planData?.plan?.isEnterprisePlan,
          plans,
        })}
        plans={plans}
      />
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
