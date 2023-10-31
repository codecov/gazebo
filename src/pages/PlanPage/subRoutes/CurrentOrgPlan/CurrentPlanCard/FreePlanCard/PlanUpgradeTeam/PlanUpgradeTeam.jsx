import { useParams } from 'react-router-dom'

import { useAvailablePlans, usePlanData } from 'services/account'
import BenefitList from 'shared/plan/BenefitList'
import { findTeamPlans, isFreePlan } from 'shared/utils/billing'
import Button from 'ui/Button'

function PlanUpgradeTeam() {
  const { provider, owner } = useParams()
  const { data: planData } = usePlanData({
    provider,
    owner,
  })
  const currentPlan = planData?.plan
  const { data: plans } = useAvailablePlans({ provider, owner })

  const { teamPlanMonth, teamPlanYear } = findTeamPlans({
    plans,
  })
  const monthlyTeamBenefits = teamPlanMonth?.benefits
  const monthlyMarketingName = teamPlanMonth?.marketingName
  const monthlyUnitPrice = teamPlanMonth?.baseUnitPrice
  const yearlyUnitPrice = teamPlanYear?.baseUnitPrice

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col border">
        <div className="flex flex-row gap-2 p-4">
          <h2 className="font-semibold">{monthlyMarketingName} plan</h2>
        </div>
        <hr />
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Includes</p>
            <BenefitList
              benefits={monthlyTeamBenefits}
              iconName="check"
              iconColor="text-ds-pink-quinary"
            />
          </div>
          <div className="flex flex-col gap-3 border-t pt-2 sm:border-0 sm:p-0">
            <p className="text-xs font-semibold">Pricing</p>
            <div className="text-xs">
              <p className="font-semibold">
                <span className="text-2xl">${yearlyUnitPrice}</span>
                /per user, per month
              </p>
              <p className="text-ds-gray-senary">
                billed annually, or ${monthlyUnitPrice} per user billing monthly
              </p>
            </div>
            <div className="flex self-start">
              <Button to={{ pageName: 'upgradeOrgPlan' }} variant="primary">
                {isFreePlan(currentPlan?.planName)
                  ? 'Upgrade to Team'
                  : 'Manage plan'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanUpgradeTeam
