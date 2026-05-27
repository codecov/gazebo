import PropTypes from 'prop-types'
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
import { Alert } from 'ui/Alert'
import LoadingLogo from 'ui/LoadingLogo'

import UpgradeDetails from './UpgradeDetails'
import UpgradeForm from './UpgradeForm'
import { usePlanParams } from './UpgradeForm/hooks/usePlanParams'

import { useSetCrumbs } from '../../context'

const UpgradePlanLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function UpgradePlanPageContent({ plans, planData }) {
  const { provider, owner } = useParams()
  const setCrumbs = useSetCrumbs()
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

function UpgradePlanPage() {
  const { provider, owner } = useParams()
  const {
    data: plans,
    isLoading: isPlansLoading,
    isError: isPlansError,
  } = useAvailablePlans({ provider, owner })
  const {
    data: planData,
    isLoading: isPlanDataLoading,
    isError: isPlanDataError,
  } = usePlanData({ provider, owner })

  const isLoading = isPlansLoading || isPlanDataLoading

  if (isLoading) {
    return <UpgradePlanLoader />
  }

  if (isPlansError || isPlanDataError) {
    return (
      <div className="mt-8 md:w-11/12 lg:w-10/12">
        <Alert variant="error">
          <Alert.Title>Unable to load billing information</Alert.Title>
          <Alert.Description>
            Something went wrong while loading your plan. Please refresh the
            page or try again later.
          </Alert.Description>
        </Alert>
      </div>
    )
  }

  if (!Array.isArray(plans) || plans.length === 0) {
    return (
      <div className="mt-8 md:w-11/12 lg:w-10/12">
        <Alert variant="error">
          <Alert.Title>No upgrade options available</Alert.Title>
          <Alert.Description>
            We could not find any plans for this organization. If this problem
            continues, please contact support.
          </Alert.Description>
        </Alert>
      </div>
    )
  }

  if (!planData) {
    return (
      <div className="mt-8 md:w-11/12 lg:w-10/12">
        <Alert variant="error">
          <Alert.Title>Unable to load plan details</Alert.Title>
          <Alert.Description>
            We could not load your current plan for this organization. Please
            refresh the page or try again later.
          </Alert.Description>
        </Alert>
      </div>
    )
  }

  return <UpgradePlanPageContent plans={plans} planData={planData} />
}

UpgradePlanPageContent.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.object).isRequired,
  planData: PropTypes.shape({
    plan: PropTypes.shape({
      isEnterprisePlan: PropTypes.bool,
      isTeamPlan: PropTypes.bool,
      isFreePlan: PropTypes.bool,
    }),
  }).isRequired,
}

export default UpgradePlanPage
