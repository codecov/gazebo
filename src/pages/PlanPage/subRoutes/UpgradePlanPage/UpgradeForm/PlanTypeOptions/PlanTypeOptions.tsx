import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { useAvailablePlans, usePlanData } from 'services/account'
import { useLocationParams } from 'services/navigation'
import { TierNames } from 'services/tier'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  isMonthlyPlan,
  Plan,
  PlanName,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import OptionButton from 'ui/OptionButton'

import { TierName } from '../constants'
import { usePlanParams } from '../hooks/usePlanParams'
import { UpgradeFormFields } from '../UpgradeForm'

interface PlanTypeOptionsProps {
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (x?: Plan) => void
  newPlan?: PlanName
}

const PlanTypeOptions: React.FC<PlanTypeOptionsProps> = ({
  setFormValue,
  setSelectedPlan,
  newPlan,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { proPlanYear, proPlanMonth } = findProPlans({ plans })
  const planParam = usePlanParams()

  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({
    plans,
  })

  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })

  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear
  const monthlyProPlan = isSentryUpgrade ? sentryPlanMonth : proPlanMonth

  const currentFormValue = newPlan
  const monthlyPlan = isMonthlyPlan(currentFormValue)

  let planOption = null
  if (
    (hasTeamPlans && planParam === TierNames.TEAM) ||
    planData?.plan?.isTeamPlan
  ) {
    planOption = TierName.TEAM
  } else {
    planOption = TierName.PRO
  }

  const { updateParams } = useLocationParams({ plan: planOption })

  if (hasTeamPlans) {
    return (
      <div className="flex w-fit flex-col gap-2">
        <h3 className="font-semibold">Choose a plan</h3>
        <div className="inline-flex items-center gap-2">
          <OptionButton
            type="button"
            active={planOption}
            onChange={({ text }) => {
              if (text === TierName.PRO) {
                if (monthlyPlan) {
                  setSelectedPlan(monthlyProPlan)
                  setFormValue('newPlan', monthlyProPlan?.value)
                } else {
                  setSelectedPlan(yearlyProPlan)
                  setFormValue('newPlan', yearlyProPlan?.value)
                }
                updateParams({ plan: TierNames.PRO })
              } else {
                if (monthlyPlan) {
                  setSelectedPlan(teamPlanMonth)
                  setFormValue('newPlan', teamPlanMonth?.value)
                } else {
                  setSelectedPlan(teamPlanYear)
                  setFormValue('newPlan', teamPlanYear?.value)
                }
                updateParams({ plan: TierNames.TEAM })
              }
            }}
            options={[
              {
                text: TierName.PRO,
              },
              {
                text: TierName.TEAM,
              },
            ]}
          />
          {planOption === TierName.TEAM && (
            <p>Up to {TEAM_PLAN_MAX_ACTIVE_USERS} users</p>
          )}
        </div>
      </div>
    )
  } else if (isSentryUpgrade) {
    return (
      <div>
        <h3 className="font-semibold">Plan</h3>
        <p>$29 monthly includes 5 seats.</p>
      </div>
    )
  } else {
    return null
  }
}

export default PlanTypeOptions
