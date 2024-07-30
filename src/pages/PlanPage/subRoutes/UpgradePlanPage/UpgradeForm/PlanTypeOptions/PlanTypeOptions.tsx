import { UseFormSetValue } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import {
  IndividualPlan,
  useAccountDetails,
  useAvailablePlans,
} from 'services/account'
import { TierNames } from 'services/tier'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  isMonthlyPlan,
  isTeamPlan,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import OptionButton from 'ui/OptionButton'

import { TierName } from '../constants'
import { usePlanParams } from '../hooks/usePlanParams'
import { UpgradeFormFields } from '../UpgradeForm'

interface PlanTypeOptionsProps {
  multipleTiers: boolean
  setFormValue: UseFormSetValue<UpgradeFormFields>
  setSelectedPlan: (x: IndividualPlan) => void
  newPlan: string
}

const PlanTypeOptions: React.FC<PlanTypeOptionsProps> = ({
  multipleTiers,
  setFormValue,
  setSelectedPlan,
  newPlan,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { proPlanYear, proPlanMonth } = findProPlans({ plans })
  const planParam = usePlanParams()

  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({
    plans,
  })

  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isSentryUpgrade = canApplySentryUpgrade({ plan, plans })

  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear
  const monthlyProPlan = isSentryUpgrade ? sentryPlanMonth : proPlanMonth

  const currentFormValue = newPlan
  let planOption = null
  if (
    (hasTeamPlans && planParam === TierNames.TEAM) ||
    isTeamPlan(currentFormValue)
  ) {
    planOption = TierName.TEAM
  } else {
    planOption = TierName.PRO
  }

  const monthlyPlan = isMonthlyPlan(currentFormValue)
  if (hasTeamPlans && multipleTiers) {
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
              } else {
                if (monthlyPlan) {
                  setSelectedPlan(teamPlanMonth)
                  setFormValue('newPlan', teamPlanMonth?.value)
                } else {
                  setSelectedPlan(teamPlanYear)
                  setFormValue('newPlan', teamPlanYear?.value)
                }
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
