import { useLayoutEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { useAccountDetails, usePlans } from 'services/account'
import {
  findSentryPlans,
  isEnterprisePlan,
  isFreePlan,
  useProPlans,
} from 'shared/utils/billing'

import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'

import { useSetCrumbs } from '../../context'

function UpgradePlanPage() {
  const { provider, owner } = useParams()
  const setCrumbs = useSetCrumbs()
  const { data: accountDetails } = useAccountDetails({ provider, owner })
  const { data: plans } = usePlans(provider)
  const { proPlanMonth, proPlanYear } = useProPlans({ plans })
  const { sentryPlanMonth, sentryPlanYear } = findSentryPlans({ plans })

  const plan = accountDetails?.rootOrganization?.plan ?? accountDetails?.plan
  const scheduledPhase = accountDetails?.scheduleDetail?.scheduledPhase

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
      <UpgradeDetails
        accountDetails={accountDetails}
        plan={plan}
        plans={plans}
        proPlanMonth={proPlanMonth}
        proPlanYear={proPlanYear}
        sentryPlanMonth={sentryPlanMonth}
        sentryPlanYear={sentryPlanYear}
        scheduledPhase={scheduledPhase}
      />
      <UpgradeForm
        accountDetails={accountDetails}
        proPlanYear={proPlanYear}
        proPlanMonth={proPlanMonth}
        sentryPlanYear={sentryPlanYear}
        sentryPlanMonth={sentryPlanMonth}
      />
    </div>
  )
}

export default UpgradePlanPage
