import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
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

  // Track if both APIs have loaded to avoid race conditions
  const dataLoaded = !!plans && !!planData

  // Only calculate defaultPaidPlan when BOTH APIs have loaded
  // This prevents race conditions where plans loads before planData,
  // causing annual users to see monthly plans selected by default
  const defaultPaidPlan = useMemo(() => {
    if (!dataLoaded) return null

    // Get the plan matching user's current billing rate only
    // Users should only see yearly plans if they're currently on yearly
    const getPlan = (yearlyPlan, monthlyPlan) =>
      isYearlyPlan ? yearlyPlan : monthlyPlan

    let plan = null

    // URL param takes priority over current plan type
    if (hasTeamPlans && planParam === TierNames.TEAM) {
      // Explicit URL request for team plan
      plan = getPlan(teamPlanYear, teamPlanMonth)
    } else if (planParam === TierNames.PRO) {
      // Explicit URL request for pro plan
      if (isSentryUpgrade) {
        plan = getPlan(sentryPlanYear, sentryPlanMonth)
      } else {
        plan = getPlan(proPlanYear, proPlanMonth)
      }
    } else if (planData?.plan?.isTeamPlan) {
      // No URL param, default to current plan type (team)
      plan = getPlan(teamPlanYear, teamPlanMonth)
    } else if (isSentryUpgrade) {
      plan = getPlan(sentryPlanYear, sentryPlanMonth)
    } else {
      plan = getPlan(proPlanYear, proPlanMonth)
    }

    // Fallback chain: if requested plan type is unavailable, try others
    // (same billing rate only, only try plans that are actually available)
    // For sentry-eligible users, prefer sentry over pro
    return (
      plan ||
      (isSentryUpgrade
        ? getPlan(sentryPlanYear, sentryPlanMonth)
        : getPlan(proPlanYear, proPlanMonth)) ||
      (hasTeamPlans && getPlan(teamPlanYear, teamPlanMonth)) ||
      null
    )
  }, [
    dataLoaded,
    hasTeamPlans,
    planParam,
    isYearlyPlan,
    teamPlanYear,
    teamPlanMonth,
    isSentryUpgrade,
    sentryPlanYear,
    sentryPlanMonth,
    proPlanYear,
    proPlanMonth,
    planData?.plan?.isTeamPlan,
  ])

  const [selectedPlan, setSelectedPlan] = useState(null)

  // Sync selectedPlan when data loads and plan becomes available
  // This won't override user selections because:
  // 1. Before BOTH APIs return, defaultPaidPlan is null
  // 2. After user selects, selectedPlan is no longer null
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

  // Show error if data loaded but no viable plans found
  if (dataLoaded && !defaultPaidPlan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-ds-gray-octonary">
          Unable to load available plans. Please try again later.
        </p>
      </div>
    )
  }

  // Don't render form until both APIs have loaded and selectedPlan is set
  // This prevents the form from initializing with wrong default values
  if (!selectedPlan) {
    return null
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
