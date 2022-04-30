import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import config from 'config'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'

import Header from './shared/Header'
import SideMenuAccount from './SideMenuAccount'

const AccessTab = lazy(() => import('./tabs/Access'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const BillingAndUsersTab = lazy(() => import('./tabs/BillingAndUsers'))
const CancelPlanTab = lazy(() => import('./tabs/CancelPlan'))
const InvoiceDetailTab = lazy(() => import('./tabs/InvoiceDetail'))
const InvoicesTab = lazy(() => import('./tabs/Invoices'))
const NotFound = lazy(() => import('../NotFound'))
const UpgradePlanTab = lazy(() => import('./tabs/UpgradePlan'))
const YAMLTab = lazy(() => import('./tabs/YAML'))

const stripePromise = loadStripe(config.STRIPE_KEY)

function AccountSettings() {
  const { provider, owner } = useParams()

  const tabLoading = (
    <div className="h-full w-full flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <Elements stripe={stripePromise}>
      <Header />
      <SidebarLayout sidebar={<SideMenuAccount />}>
        <Suspense fallback={tabLoading}>
          <Switch>
            <Route path="/account/:provider/:owner/" exact>
              <AdminTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/yaml/" exact>
              <YAMLTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/access/" exact>
              <AccessTab provider={provider} />
            </Route>
            <Route path="/account/:provider/:owner/billing/" exact>
              <BillingAndUsersTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/users/" exact>
              <Redirect to={`/account/${provider}/${owner}/billing/`} />
            </Route>
            <Route path="/account/:provider/:owner/billing/upgrade/" exact>
              <UpgradePlanTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/billing/cancel/" exact>
              <CancelPlanTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/invoices/" exact>
              <InvoicesTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/invoices/:id/" exact>
              <InvoiceDetailTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/*">
              <NotFound />
            </Route>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </Elements>
  )
}

export default AccountSettings
