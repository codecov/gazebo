import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import config from 'config'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useOwner } from 'services/user'

import CancelPlanPage from './CancelPlan'
import { PlanBreadcrumbProvider } from './context'
import CurrentOrgPlan from './CurrentOrgPlan'
import Header from './Header'
import InvoiceDetail from './InvoiceDetail'
import Invoices from './Invoices'
import PlanBreadcrumb from './PlanBreadcrumb'
import Tabs from './Tabs'
import UpgradePlan from './UpgradePlan'

const stripePromise = loadStripe(config.STRIPE_KEY)
const path = '/plan/:provider/:owner'

const Loader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

function PlanPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = useOwner({ username: owner })

  if (config.IS_SELF_HOSTED) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  return (
    <div className="flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <Elements stripe={stripePromise}>
        <PlanBreadcrumbProvider>
          <PlanBreadcrumb />
          <hr className="md:w-10/12" />
          <Suspense fallback={Loader}>
            <Switch>
              <Route path={path} exact>
                <CurrentOrgPlan />
              </Route>
              <Route path={`${path}/upgrade`} exact>
                <UpgradePlan />
              </Route>
              <Route path={`${path}/cancel`} exact>
                <CancelPlanPage />
              </Route>
              <Route path={`${path}/invoices`} exact>
                <Invoices />
              </Route>
              <Route path={`${path}/invoices/:id`} exact>
                <InvoiceDetail />
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
