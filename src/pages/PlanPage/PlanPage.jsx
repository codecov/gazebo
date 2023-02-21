import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import LogoSpinner from 'old_ui/LogoSpinner'
import { usePlanPageData } from 'pages/PlanPage/hooks'

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
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LogoSpinner />
  </div>
)

function PlanPage() {
  const { owner, provider } = useParams()
  const { data: ownerData } = usePlanPageData()

  if (config.IS_SELF_HOSTED) {
    return <Redirect to={`/${provider}/${owner}`} />
  }

  return (
    <div className="mt-2 flex flex-col gap-4">
      <Header />
      {ownerData?.isCurrentUserPartOfOrg && <Tabs />}
      <Elements stripe={stripePromise}>
        <PlanBreadcrumbProvider>
          <PlanBreadcrumb />
          <hr className="md:w-11/12 lg:w-10/12" />
          <Suspense fallback={Loader}>
            <Switch>
              <SentryRoute path={path} exact>
                <CurrentOrgPlan />
              </SentryRoute>
              <SentryRoute path={`${path}/upgrade`} exact>
                <UpgradePlan />
              </SentryRoute>
              <SentryRoute path={`${path}/cancel`} exact>
                <CancelPlanPage />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices`} exact>
                <Invoices />
              </SentryRoute>
              <SentryRoute path={`${path}/invoices/:id`} exact>
                <InvoiceDetail />
              </SentryRoute>
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
