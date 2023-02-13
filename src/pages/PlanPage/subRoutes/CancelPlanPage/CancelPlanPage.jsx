import { lazy, Suspense } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import Spinner from 'ui/Spinner'

import SpecialOffer from './subRoutes/SpecialOffer'

const DowngradePlan = lazy(() => import('./subRoutes/DowngradePlan'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CancelPlanPage() {
  return (
    <Switch>
      <SentryRoute path="/plan/:provider/:owner/cancel/downgrade" exact>
        <Suspense fallback={<Loader />}>
          <DowngradePlan />
        </Suspense>
      </SentryRoute>
      <SentryRoute path="/plan/:provider/:owner/cancel" exact>
        <SpecialOffer />
      </SentryRoute>
      <Redirect
        from="/plan/:provider/:owner/cancel/*"
        to="/plan/:provider/:owner/cancel"
      />
    </Switch>
  )
}

export default CancelPlanPage
