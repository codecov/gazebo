import isNumber from 'lodash/isNumber'
import PropType from 'prop-types'
import { useParams } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'
import {
  planPropType,
  TrialStatuses,
  usePlanData,
  usePlans,
} from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import ScheduledPlanDetails from 'shared/plan/ScheduledPlanDetails'
import {
  canApplySentryUpgrade,
  findSentryPlans,
  isTrialPlan,
  useProPlans,
} from 'shared/utils/billing'
import { SENTRY_PRICE } from 'shared/utils/upgradeForm'
import A from 'ui/A'

import ProPlanSubheading from './ProPlanSubheading'

import ActionsBilling from '../shared/ActionsBilling/ActionsBilling'
import PlanPricing from '../shared/PlanPricing'

function PlanDetails({
  isSentryUpgrade,
  sentryAnnualUnitPrice,
  proMonthlyUnitPrice,
  proYearlyUnitPrice,
}) {
  if (isSentryUpgrade) {
    return (
      <div className="text-xs">
        <p className="font-semibold">
          <span className="text-2xl">${SENTRY_PRICE}</span>
          /per month
        </p>
        <p className="text-ds-gray-senary">
          over 5 users is ${sentryAnnualUnitPrice}/per user per month, billed
          annually
        </p>
      </div>
    )
  }

  return (
    <div className="text-xs">
      <p className="font-semibold">
        <span className="text-2xl">${proYearlyUnitPrice}</span>
        /per user, per month
      </p>
      <p className="text-ds-gray-senary">
        billed annually, or ${proMonthlyUnitPrice} per user billing monthly
      </p>
    </div>
  )
}

PlanDetails.propTypes = {
  isSentryUpgrade: PropType.bool.isRequired,
  sentryAnnualUnitPrice: PropType.number,
  proMonthlyUnitPrice: PropType.number,
  proYearlyUnitPrice: PropType.number,
}

function PlanUpgrade({ isSentryUpgrade, plans }) {
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })

  const upgradeToPlan = isSentryUpgrade ? sentryPlanYear : proPlanMonth

  return (
    <div className="flex flex-col border">
      <div className="p-4">
        <h2 className="font-semibold">{upgradeToPlan?.marketingName} plan</h2>
        <ProPlanSubheading />
      </div>
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
          <PlanDetails
            isSentryUpgrade={isSentryUpgrade}
            sentryAnnualUnitPrice={sentryPlanYear?.baseUnitPrice}
            proMonthlyUnitPrice={proPlanMonth?.baseUnitPrice}
            proYearlyUnitPrice={proPlanYear?.baseUnitPrice}
          />
          <ActionsBilling />
        </div>
      </div>
    </div>
  )
}

PlanUpgrade.propTypes = {
  isSentryUpgrade: PropType.bool.isRequired,
  plans: PropType.arrayOf(planPropType).isRequired,
}

function FreePlanCard({ plan, scheduledPhase }) {
  const { provider, owner } = useParams()

  const { data: ownerData } = usePlanPageData()

  const { data: planData } = usePlanData({
    provider,
    owner,
  })

  const { data: plans } = usePlans(provider)

  const uploadsNumber = ownerData?.numberOfUploads
  const trialOngoing =
    isTrialPlan(planData?.plan?.planName) &&
    planData?.plan.trialStatus === TrialStatuses.ONGOING

  let benefits = plan?.benefits
  let planName = plan?.value
  let baseUnitPrice = plan?.baseUnitPrice
  let marketingName = plan?.marketingName
  if (trialOngoing) {
    benefits = planData?.pretrialPlan?.benefits
    planName = planData?.pretrialPlan?.planName
    baseUnitPrice = planData?.pretrialPlan?.baseUnitPrice
    marketingName = planData?.pretrialPlan?.marketingName
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col border">
        <div className="p-4">
          <h2 className="font-semibold">{marketingName} plan</h2>
          <span className="text-gray-500">
            {trialOngoing
              ? "You'll be downgraded to the Developer plan when your trial expires."
              : 'Current Plan'}
          </span>
        </div>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={benefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </div>
          <div className="flex flex-col gap-3 border-t pt-2 sm:border-0 sm:p-0">
            <p className="text-xs font-semibold">Pricing</p>
            <PlanPricing value={planName} baseUnitPrice={baseUnitPrice} />
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
      <PlanUpgrade
        isSentryUpgrade={canApplySentryUpgrade({ plan, plans })}
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
