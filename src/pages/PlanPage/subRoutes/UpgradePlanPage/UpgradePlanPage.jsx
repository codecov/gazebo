import { useLayoutEffect, useState } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAccountDetails, useAvailablePlans } from 'services/account'
import { TierNames } from 'services/tier'
import {
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  isEnterprisePlan,
  isFreePlan,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'

import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'
import { usePlanParams } from './UpgradeForm/hooks/usePlanParams'

import { useSetCrumbs } from '../../context'

function UpgradePlanPage() {
  const { provider, owner } = useParams()
  const setCrumbs = useSetCrumbs()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = useAvailablePlans({ provider, owner })
  const planParam = usePlanParams()

  const { proPlanYear } = findProPlans({ plans })
  const { sentryPlanYear } = findSentryPlans({ plans })
  const { teamPlanYear } = findTeamPlans({ plans })
  const hasTeamPlans = shouldDisplayTeamCard({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan

  const isSentryUpgrade = canApplySentryUpgrade({ plan, plans })

  let defaultPaidYearlyPlan = null
  if (hasTeamPlans && planParam === TierNames.TEAM) {
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
        text: isFreePlan(plan?.value) ? 'upgrade plan' : 'manage plan',
      },
    ])
  }, [setCrumbs, plan?.value])

  // redirect right away if the user is on an enterprise plan
  if (isEnterprisePlan(plan?.value)) {
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
