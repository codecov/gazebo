import { Suspense } from 'react'
import { useParams, Switch, Route } from 'react-router-dom'

import { useBaseUrl } from 'shared/router'
import LogoSpinner from 'components/LogoSpinner'
import PageLayout from 'components/pages/shared/SidebarLayout'

import SideMenu from './SideMenu'
import AdminTab from './tabs/Admin'
import BillingAndUsersTab from './tabs/BillingAndUsers'
import YAMLTab from './tabs/YAML'
import CancelPlanTab from './tabs/CancelPlan'
import UpgradePlanTab from './tabs/UpgradePlan'

function AccountSettings() {
  const { provider, owner } = useParams()
  const baseUrl = useBaseUrl()

  // it's a slightly different menu / pages if the owner is a Org or a user
  // so we will need to fetch the information at this level
  // and render different UI according to the type of user

  return (
    <PageLayout sidebar={<SideMenu baseUrl={baseUrl} />}>
      <Suspense fallback={<LogoSpinner />}>
        <Switch>
          <Route path={baseUrl + ''} exact>
            <BillingAndUsersTab provider={provider} owner={owner} />
          </Route>
          <Route path={baseUrl + 'billing/upgrade'}>
            <UpgradePlanTab provider={provider} owner={owner} />
          </Route>
          <Route path={baseUrl + 'billing/cancel'}>
            <CancelPlanTab provider={provider} owner={owner} />
          </Route>
          <Route path={baseUrl + 'yaml'}>
            <YAMLTab />
          </Route>
          <Route path={baseUrl + 'admin'}>
            <AdminTab />
          </Route>
        </Switch>
      </Suspense>
    </PageLayout>
  )
}

export default AccountSettings
