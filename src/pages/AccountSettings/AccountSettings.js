import { Suspense, lazy } from 'react'
import {
  useParams,
  Switch,
  Route,
  Redirect,
  useRouteMatch,
} from 'react-router-dom'

import LogoSpinner from 'ui/LogoSpinner'
import { useBaseUrl } from 'shared/router'
import SidebarLayout from 'layouts/SidebarLayout'
import { useUser } from 'services/user'

import SideMenu from './SideMenu'
import AdminTab from './tabs/Admin'
import BillingAndUsersTab from './tabs/BillingAndUsers'
import YAMLTab from './tabs/YAML'

const CancelPlanTab = lazy(() => import('./tabs/CancelPlan'))
const UpgradePlanTab = lazy(() => import('./tabs/UpgradePlan'))
const InvoicesTab = lazy(() => import('./tabs/Invoices'))
const InvoiceDetailTab = lazy(() => import('./tabs/InvoiceDetail'))

function AccountSettings() {
  const { data: user } = useUser()
  const { provider, owner } = useParams()
  const { path } = useRouteMatch()
  const baseUrl = useBaseUrl()
  const isPersonalSettings = user.username === owner

  const tabLoading = (
    <div className="h-full w-full flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <SidebarLayout
      sidebar={
        <SideMenu baseUrl={baseUrl} isPersonalSettings={isPersonalSettings} />
      }
    >
      <Suspense fallback={tabLoading}>
        <Switch>
          <Route path={path} exact>
            <AdminTab isPersonalSettings={isPersonalSettings} />
          </Route>
          <Route path={path + 'yaml'} exact>
            <YAMLTab />
          </Route>
          <Route path={path + 'access'} exact>
            AccessTab :)
          </Route>
          <Route path={path + 'billing'} exact>
            <BillingAndUsersTab provider={provider} owner={owner} />
          </Route>
          <Route path={path + 'users'} exact>
            <Redirect to={baseUrl + 'billing'} />
          </Route>
          <Route path={path + 'billing/upgrade'} exact>
            <UpgradePlanTab provider={provider} owner={owner} />
          </Route>
          <Route path={path + 'billing/cancel'} exact>
            <CancelPlanTab provider={provider} owner={owner} />
          </Route>
          <Route path={path + 'invoices'} exact>
            <InvoicesTab provider={provider} owner={owner} />
          </Route>
          <Route path={path + 'invoices/:id'} exact>
            <InvoiceDetailTab provider={provider} owner={owner} />
          </Route>
        </Switch>
      </Suspense>
    </SidebarLayout>
  )
}

export default AccountSettings
