import { Suspense, lazy } from 'react'
import { useParams, Switch, Route, Redirect } from 'react-router-dom'

import LogoSpinner from 'old_ui/LogoSpinner'
import SidebarLayout from 'layouts/SidebarLayout'

import SideMenuAccount from './SideMenuAccount'
import Header from './Header'

const CancelPlanTab = lazy(() => import('./tabs/CancelPlan'))
const UpgradePlanTab = lazy(() => import('./tabs/UpgradePlan'))
const InvoicesTab = lazy(() => import('./tabs/Invoices'))
const InvoiceDetailTab = lazy(() => import('./tabs/InvoiceDetail'))
const BillingAndUsersTab = lazy(() => import('./tabs/BillingAndUsers'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const YAMLTab = lazy(() => import('./tabs/YAML'))
const AccessTab = lazy(() => import('./tabs/Access'))
const NotFound = lazy(() => import('../NotFound'))

function AccountSettings() {
  const { provider, owner } = useParams()

  const tabLoading = (
    <div className="h-full w-full flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <SidebarLayout sidebar={<SideMenuAccount />}>
        <Suspense fallback={tabLoading}>
          <Switch>
            <Route path="/account/:provider/:owner/" exact>
              <AdminTab provider={provider} owner={owner} />
            </Route>
            <Route path="/account/:provider/:owner/yaml/" exact>
              <YAMLTab />
            </Route>
            <Route path="/account/:provider/:owner/access/" exact>
              <AccessTab />
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
    </>
  )
}

export default AccountSettings
