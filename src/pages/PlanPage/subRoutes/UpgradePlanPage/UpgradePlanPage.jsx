import { useLayoutEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAvailablePlans, usePlanData } from 'services/account'
import { canApplySentryUpgrade ,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  shouldDisplayTeamCard,
  TierNames,
} from 'shared/utils/billing'

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

  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const { teamPlanYear } = findTeamPlans({ plans })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })

  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })

  let defaultPaidYearlyPlan = null
  if (
    (hasTeamPlans && planParam === TierNames.TEAM) ||
    planData?.plan?.isTeamPlan
  ) {
    defaultPaidYearlyPlan = teamPlanYear
  } else if (isSentryUpgrade) {
    defaultPaidYearlyPlan = sentryPlanYear
  } else {
    defaultPaidYearlyPlan = proPlanYear
  }

  const [selectedPlan, setSelectedPlan] = useState(defaultPaidYearlyPlan)

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
