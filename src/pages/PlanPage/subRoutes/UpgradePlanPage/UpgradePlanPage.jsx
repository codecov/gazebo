import { useEffect, useLayoutEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAvailablePlans } from 'services/account/useAvailablePlans'
import { usePlanData } from 'services/account/usePlanData'
import {
  BillingRate,
  canApplySentryUpgrade,
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

  const { proPlanYear, proPlanMonth } = findProPlans({ plans })
  const { sentryPlanYear, sentryPlanMonth } = findSentryPlans({ plans })
  const { teamPlanYear, teamPlanMonth } = findTeamPlans({ plans })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })
  const isYearlyPlan = planData?.plan?.billingRate === BillingRate.ANNUALLY

  const isSentryUpgrade = canApplySentryUpgrade({
    isEnterprisePlan: planData?.plan?.isEnterprisePlan,
    plans,
  })

  // URL param takes priority over current plan type
  let defaultPaidPlan = null
  if (hasTeamPlans && planParam === TierNames.TEAM) {
    // Explicit URL request for team plan
    defaultPaidPlan = isYearlyPlan ? teamPlanYear : teamPlanMonth
  } else if (planParam === TierNames.PRO) {
    // Explicit URL request for pro plan
    if (isSentryUpgrade) {
      defaultPaidPlan = isYearlyPlan ? sentryPlanYear : sentryPlanMonth
    } else {
      defaultPaidPlan = isYearlyPlan ? proPlanYear : proPlanMonth
    }
  } else if (planData?.plan?.isTeamPlan) {
    // No URL param, default to current plan type (team)
    defaultPaidPlan = isYearlyPlan ? teamPlanYear : teamPlanMonth
  } else if (isSentryUpgrade) {
    defaultPaidPlan = isYearlyPlan ? sentryPlanYear : sentryPlanMonth
  } else {
    defaultPaidPlan = isYearlyPlan ? proPlanYear : proPlanMonth
  }

  const [selectedPlan, setSelectedPlan] = useState(defaultPaidPlan)

  // Sync selectedPlan when data loads and plan becomes available
  // This won't override user selections because:
  // 1. Before API returns, no options exist to select
  // 2. After user selects, selectedPlan is no longer null/undefined
  useEffect(() => {
    if (defaultPaidPlan && selectedPlan == null) {
      setSelectedPlan(defaultPaidPlan)
    }
  }, [defaultPaidPlan, selectedPlan])

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
