import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import {
  TrialStatuses,
  useAccountDetails,
  useAvailablePlans,
  usePlanData,
} from 'services/account'
import {
  BillingRate,
  isProPlan,
  isTrialPlan,
  shouldDisplayTeamCard,
} from 'shared/utils/billing'
import Spinner from 'ui/Spinner'

import SpecialOffer from './subRoutes/SpecialOffer'
import TeamPlanSpecialOffer from './subRoutes/TeamPlanSpecialOffer'

const DowngradePlan = lazy(() => import('./subRoutes/DowngradePlan'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

function CancelPlanPage() {
  const { provider, owner } = useParams<{
    provider: string
    owner: string
  }>()
  const { data: accountDetailsData } = useAccountDetails({ provider, owner })
  const { data: planData } = usePlanData({ provider, owner })
  const { data: plans } = useAvailablePlans({
    provider,
    owner,
  })

  const isOnTrial =
    isTrialPlan(planData?.plan?.value) &&
    planData?.plan?.trialStatus === TrialStatuses.ONGOING

  // redirect right away if the user is on an enterprise plan
  if (planData?.plan?.isEnterprisePlan || isOnTrial) {
    return <Redirect to={`/plan/${provider}/${owner}`} />
  }

  const isMonthlyPlan =
    accountDetailsData?.plan?.billingRate === BillingRate.MONTHLY

  const discountNotApplied =
    !accountDetailsData?.subscriptionDetail?.customer?.discount
  const showSpecialOffer = discountNotApplied && isMonthlyPlan
  const showTeamSpecialOffer =
    shouldDisplayTeamCard({ plans }) &&
    isProPlan(accountDetailsData?.plan?.value)
  const showCancelPage = showSpecialOffer || showTeamSpecialOffer

  let redirectTo = `/plan/${provider}/${owner}/cancel/downgrade`
  if (showCancelPage) {
    redirectTo = `/plan/${provider}/${owner}/cancel`
  }

  return (
    <Switch>
      <SentryRoute path="/plan/:provider/:owner/cancel/downgrade" exact>
        <Suspense fallback={<Loader />}>
          <DowngradePlan />
        </Suspense>
      </SentryRoute>
      {showCancelPage && (
        <SentryRoute path="/plan/:provider/:owner/cancel" exact>
          {showTeamSpecialOffer ? <TeamPlanSpecialOffer /> : <SpecialOffer />}
        </SentryRoute>
      )}
      <Redirect from="/plan/:provider/:owner/cancel" to={redirectTo} />
    </Switch>
  )
}

export default CancelPlanPage
