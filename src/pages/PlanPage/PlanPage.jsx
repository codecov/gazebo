import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import { usePlanPageData } from 'pages/PlanPage/hooks'
import { useFlags } from 'shared/featureFlags'
import LoadingLogo from 'ui/LoadingLogo'

import { PlanProvider } from './context'
import Header from './Header'
import PlanBreadcrumb from './PlanBreadcrumb'
import Tabs from './Tabs'

const CancelPlanPage = lazy(() => import('./subRoutes/CancelPlanPage'))
const CurrentOrgPlan = lazy(() => import('./subRoutes/CurrentOrgPlan'))
const InvoicesPage = lazy(() => import('./subRoutes/InvoicesPage'))
const InvoiceDetailsPage = lazy(() => import('./subRoutes/InvoiceDetailsPage'))
const UpgradePlanPage = lazy(() => import('./subRoutes/UpgradePlanPage'))

const stripePromise = loadStripe(config.STRIPE_KEY, {
  apiVersion: '2024-04-10',
})
const path = '/plan/:provider/:owner'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function PlanPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = usePlanPageData({ owner, provider })

  const { newHeader } = useFlags({
    newHeader: false,
  })

  if (config.IS_SELF_HOSTED || !ownerData?.isCurrentUserPartOfOrg) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  return (
    <div className="mt-2 flex flex-col gap-4">
      {newHeader ? null : <Header />}
      <Tabs />
      <Elements stripe={stripePromise}>
        <PlanProvider>
          <PlanBreadcrumb />
          <Suspense fallback={<Loader />}>
            <Switch>
              <SentryRoute path={path} exact>
                <CurrentOrgPlan />
              </SentryRoute>
              <SentryRoute path={`${path}/upgrade`} exact>
                <UpgradePlanPage />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices`} exact>
                <InvoicesPage />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices/:id`} exact>
                <InvoiceDetailsPage />
              </SentryRoute>
              <SentryRoute path={`${path}/cancel`}>
                <CancelPlanPage />
              </SentryRoute>
              <Redirect
                from="/plan/:provider/:owner/*"
                to="/plan/:provider/:owner"
              />
            </Switch>
          </Suspense>
        </PlanProvider>
      </Elements>
    </div>
  )
}

export default PlanPage
