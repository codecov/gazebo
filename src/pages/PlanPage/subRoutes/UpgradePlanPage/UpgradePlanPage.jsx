import { useLayoutEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  shouldDisplayTeamCard,
  TierNames,
} from 'shared/utils/billing'
import { determineDefaultPlan } from 'shared/utils/upgradeForm'

import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'
import { usePlanParams } from './UpgradeForm/hooks/usePlanParams'

import { useSetCrumbs } from '../../context'

function UpgradePlanPage() {
  const { provider, owner } = useParams()
  const setCrumbs = useSetCrumbs()
  const { data: plans } = useAvailablePlans({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const planParam = usePlanParams()

  const { proPlanMonth } = findProPlans({ plans })
  const { sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanMonth } = findTeamPlans({ plans })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })

  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })

  let paramSelectedPlan = null
  if (hasTeamPlans && planParam === TierNames.TEAM) {
    paramSelectedPlan = teamPlanMonth
  } else if (planParam === TierNames.PRO) {
    paramSelectedPlan = isSentryUpgrade ? sentryPlanMonth : proPlanMonth
  }

  const defaultPaidMonthlyPlan = determineDefaultPlan({
    selectedPlan: paramSelectedPlan,
    currentPlan: planData?.plan,
    plans,
    isSentryUpgrade,
  })

  const [selectedPlan, setSelectedPlan] = useState(defaultPaidMonthlyPlan)

  useLayoutEffect(() => {
    setCrumbs([
      {
        pageName: 'upgradeOrgPlan',
        text: planData?.plan?.isFreePlan ? 'Upgrade plan' : 'Manage plan',
      },
    ])
  }, [setCrumbs, planData?.plan?.isFreePlan])

  // redirect right away if the user is on an enterprise plan
  if (planData?.plan?.isEnterprisePlan) {
    return <Redirect to={`/plan/${provider}/${owner}`} />
  }

  return (
    <div className="flex flex-col gap-8 md:w-11/12 md:flex-row lg:w-10/12">
      <UpgradeDetails selectedPlan={selectedPlan} />
      <UpgradeForm
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
      />
    </div>
  )
}

export default UpgradePlanPage
