import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import config from 'config'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useOwner } from 'services/user'
import { useShouldRenderTabs } from 'services/useShouldRenderTabs'

import { PlanBreadcrumbProvider } from './context'
import CurrentOrgPlan from './CurrentOrgPlan'
import Header from './Header'
import PlanBreadcrumb from './PlanBreadcrumb'
import Tabs from './Tabs'

const stripePromise = loadStripe(config.STRIPE_KEY)
const path = '/plan/:provider/:owner'

const Loader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

function PlanPage() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const shouldRenderTabs = useShouldRenderTabs()

  return (
    <div className="flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <Elements stripe={stripePromise}>
        <PlanBreadcrumbProvider>
          <PlanBreadcrumb />
          <hr className="w-4/5" />
          <Suspense fallback={Loader}>
            <Switch>
              {!shouldRenderTabs && <Redirect to="/:provider/:owner" />}
              <Route path={path} exact>
                <CurrentOrgPlan />
              </Route>
              <Route path={`${path}/plan`} exact>
                plan work
              </Route>
              <Redirect
                from="/billing/:provider/:owner/*"
                to="/billing/:provider/:owner"
              />
            </Switch>
          </Suspense>
        </PlanBreadcrumbProvider>
      </Elements>
    </div>
  )
}

export default PlanPage
