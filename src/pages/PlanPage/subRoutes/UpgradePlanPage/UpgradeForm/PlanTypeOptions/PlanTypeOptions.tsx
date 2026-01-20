import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAvailablePlans,
} from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import { useLocationParams } from 'services/navigation/useLocationParams'
import {
  BillingRate,
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  shouldDisplayTeamCard,
  TierNames,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import { RadioTileGroup } from 'ui/RadioTileGroup'

import { TierName } from '../constants'
import { UpgradeFormFields } from '../UpgradeForm'

interface PlanTypeOptionsProps {
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (x?: IndividualPlan) => void
  selectedPlan?: IndividualPlan
}

const PlanTypeOptions: React.FC<PlanTypeOptionsProps> = ({
  setFormValue,
  setSelectedPlan,
  selectedPlan,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { proPlanMonth, proPlanYear } = findProPlans({ plans })

  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })
  const { teamPlanMonth, teamPlanYear } = findTeamPlans({
    plans,
  })

  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })

  // When switching plan types, respect the user's already selected billing rate
  // Fall back to current plan's billing rate for initial default
  const isSelectedPlanAnnual = selectedPlan
    ? selectedPlan.billingRate === BillingRate.ANNUALLY
    : planData?.plan?.billingRate === BillingRate.ANNUALLY
  const proPlan = isSelectedPlanAnnual
    ? isSentryUpgrade
      ? sentryPlanYear
      : proPlanYear
    : isSentryUpgrade
      ? sentryPlanMonth
      : proPlanMonth
  const teamPlan = isSelectedPlanAnnual ? teamPlanYear : teamPlanMonth

  // Use selectedPlan to determine which option is selected
  // This keeps it in sync with UpgradePlanPage's logic
  const planOption = hasTeamPlans
    ? selectedPlan?.isTeamPlan
      ? TierName.TEAM
      : TierName.PRO
    : TierName.PRO

  const { updateParams } = useLocationParams({ plan: planOption })

  if (hasTeamPlans) {
    return (
      <div className="flex w-fit flex-col gap-2">
        <h3 className="font-semibold">Step 1: Choose a plan</h3>
        <div className="inline-flex items-center gap-2">
          <RadioTileGroup
            value={planOption}
            onValueChange={(value) => {
              // set both form value and selected plan as form version is needed for submission and selected plan is needed for UI outside of form
              if (value === TierName.PRO) {
                setSelectedPlan(proPlan)
                setFormValue('newPlan', proPlan)
                updateParams({ plan: TierNames.PRO })
              } else {
                setSelectedPlan(teamPlan)
                setFormValue('newPlan', teamPlan)
                updateParams({ plan: TierNames.TEAM })
              }
            }}
          >
            <RadioTileGroup.Item
              value={TierName.PRO}
              className="w-32"
              data-testid="radio-pro"
            >
              <RadioTileGroup.Label>{TierName.PRO}</RadioTileGroup.Label>
            </RadioTileGroup.Item>
            <RadioTileGroup.Item
              value={TierName.TEAM}
              className="w-32"
              data-testid="radio-team"
            >
              <RadioTileGroup.Label>{TierName.TEAM}</RadioTileGroup.Label>
            </RadioTileGroup.Item>
          </RadioTileGroup>
          {planOption === TierName.TEAM && (
            <p>Up to {TEAM_PLAN_MAX_ACTIVE_USERS} paid users</p>
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
