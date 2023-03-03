import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useAccountDetails } from 'services/account'
import { isMonthlyPlan } from 'shared/utils/billing'
import Spinner from 'ui/Spinner'

import SpecialOffer from './subRoutes/SpecialOffer'

const DowngradePlan = lazy(() => import('./subRoutes/DowngradePlan'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CancelPlanPage() {
  const { provider, owner } = useParams()
  const { data: accountDetailsData } = useAccountDetails({ provider, owner })

  const discountNotApplied =
    !accountDetailsData?.subscriptionDetail?.customer?.discount
  const showDiscount =
    discountNotApplied && isMonthlyPlan(accountDetailsData?.plan?.value)

  let redirectTo = '/plan/:provider/:owner/cancel/downgrade'
  if (showDiscount) {
    redirectTo = '/plan/:provider/:owner/cancel'
  }

  return (
    <Switch>
      <SentryRoute path="/plan/:provider/:owner/cancel/downgrade" exact>
        <Suspense fallback={<Loader />}>
          <DowngradePlan />
        </Suspense>
      </SentryRoute>
      {showDiscount && (
        <SentryRoute path="/plan/:provider/:owner/cancel" exact>
          <SpecialOffer />
        </SentryRoute>
      )}
      <Redirect from="/plan/:provider/:owner/cancel" to={redirectTo} />
    </Switch>
  )
}

export default CancelPlanPage
