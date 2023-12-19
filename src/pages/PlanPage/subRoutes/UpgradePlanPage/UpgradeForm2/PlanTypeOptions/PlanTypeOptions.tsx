import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import {
  IndividualPlanSchema,
  useAccountDetails,
  useAvailablePlans,
} from 'services/account'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import OptionButton from 'ui/OptionButton'

import { PlanTiers, TierName } from '../constants'

interface PlanTypeOptionsProps {
  multipleTiers: boolean
  setFormValue: (x: string, y: string) => void
  setSelectedPlan: (x: z.infer<typeof IndividualPlanSchema>) => void
}

const PlanTypeOptions: React.FC<PlanTypeOptionsProps> = ({
  multipleTiers,
  setFormValue,
  setSelectedPlan,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { proPlanYear } = findProPlans({ plans })

  const { sentryPlanYear } = findSentryPlans({ plans })
  const { teamPlanYear } = findTeamPlans({
    plans,
  })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const isSentryUpgrade = canApplySentryUpgrade({ plan, plans })
  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear

  const [option, setOption] = useState<PlanTiers>(TierName.PRO)

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
                setSelectedPlan(yearlyProPlan)
                setFormValue('newPlan', yearlyProPlan?.value)
              } else {
                setSelectedPlan(teamPlanYear)
                setFormValue('newPlan', teamPlanYear?.value)
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
