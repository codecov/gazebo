import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  IndividualPlanSchema,
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
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import OptionButton from 'ui/OptionButton'

import { PlanTiers, TierName } from '../constants'
import { usePlanParams } from '../hooks/usePlanParams'

interface PlanTypeOptionsProps {
  multipleTiers: boolean
  setFormValue: (x: string, y: string) => void
  setSelectedPlan: (x: z.infer<typeof IndividualPlanSchema>) => void
  getFormValues?: () => { newPlan: string; seats: number }
}

const PlanTypeOptions: React.FC<PlanTypeOptionsProps> = ({
  multipleTiers,
  setFormValue,
  setSelectedPlan,
  getFormValues = () => ({ newPlan: '', seats: 0 }),
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

  let planOption = null
  if (hasTeamPlans && planParam === TierNames.TEAM) {
    planOption = TierName.TEAM
  } else {
    planOption = TierName.PRO
  }

  const [option, setOption] = useState<PlanTiers>(planOption)
  const currentFormValue = getFormValues().newPlan
  const monthlyPlan = isMonthlyPlan(currentFormValue)

  if (hasTeamPlans && multipleTiers) {
    return (
      <div className="flex w-fit flex-col gap-2">
        <h3 className="font-semibold">Plan</h3>
        <div className="inline-flex items-center gap-2">
          <OptionButton
            type="button"
            active={option}
            onChange={({ text }) => {
              if (text === TierName.PRO) {
                if (monthlyPlan) {
                  setSelectedPlan(proPlanMonth)
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
              setOption(text)
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
          {option === TierName.TEAM && (
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
