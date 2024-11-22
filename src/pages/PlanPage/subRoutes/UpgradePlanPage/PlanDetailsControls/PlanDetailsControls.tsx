import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account'
import {
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  Plan,
} from 'shared/utils/billing'
import { TEAM_PLAN_MAX_ACTIVE_USERS } from 'shared/utils/upgradeForm'
import OptionButton from 'ui/OptionButton'

interface PlanDetailsControlsProps {
  setSelectedPlan: (x?: Plan) => void
  setValue: (x: string, y?: string) => void
  isSentryUpgrade: boolean
}

const PlanDetailsControls: React.FC<PlanDetailsControlsProps> = ({
  setValue,
  setSelectedPlan,
  isSentryUpgrade,
}) => {
  const { provider, owner } = useParams<{ provider: string; owner: string }>()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const { teamPlanYear } = findTeamPlans({
    plans,
  })
  const [option, setOption] = useState<'Pro' | 'Team'>('Pro')

  const yearlyProPlan = isSentryUpgrade ? sentryPlanYear : proPlanYear

  return (
    <div className="flex w-fit flex-col gap-2">
      <h3 className="font-semibold">Plan</h3>
      <div className="inline-flex items-center gap-2">
        <OptionButton
          type="button"
          active={option}
          onChange={({ text }) => {
            if (text === 'Pro') {
              setSelectedPlan(yearlyProPlan)
              setValue('newPlan', yearlyProPlan?.value)
            } else {
              setSelectedPlan(teamPlanYear)
              setValue('newPlan', teamPlanYear?.value)
            }
            setOption(text)
          }}
          options={[
            {
              text: 'Pro',
            },
            {
              text: 'Team',
            },
          ]}
        />
        {option === 'Team' && <p>Up to {TEAM_PLAN_MAX_ACTIVE_USERS} users</p>}
      </div>
    </div>
  )
}

export default PlanDetailsControls
