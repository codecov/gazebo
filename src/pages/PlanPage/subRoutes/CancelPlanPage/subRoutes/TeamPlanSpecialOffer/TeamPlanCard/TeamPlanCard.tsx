import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account/useAvailablePlans'
import BenefitList from 'shared/plan/BenefitList'
import { findTeamPlans } from 'shared/utils/billing'
import Button from 'ui/Button'

const TeamPlanCard: React.FC = () => {
  const { provider, owner } = useParams<{
    provider: string
    owner: string
  }>()

  const { data: plans } = useAvailablePlans({ provider, owner })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({
    plans,
  })

  return (
    <div className="flex flex-col border">
      <div className="flex justify-between p-4">
        <h2 className="font-semibold">{teamPlanYear?.marketingName} plan</h2>
        <div className="flex self-start">
          <Button
            to={{
              pageName: 'upgradeOrgPlan',
              options: { params: { plan: 'team' } },
            }}
            variant="primary"
            disabled={undefined}
            hook="upgrade plan"
          >
            Change to Team plan
          </Button>
        </div>
      </div>
      <hr />
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:gap-0">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold">Includes</p>
          <BenefitList
            benefits={teamPlanYear?.benefits}
            iconName="check"
            iconColor="text-ds-pink-default"
          />
        </div>
        <div className="flex flex-col gap-2 border-t pt-2 sm:border-0 sm:p-0">
          <p className="text-xs font-semibold">Pricing</p>
          <div>
            <p className="font-semibold">
              <span className="text-2xl">${teamPlanMonth?.baseUnitPrice}</span>{' '}
              per user/month
            </p>
            <p className="text-ds-gray-senary">billed monthly</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamPlanCard
