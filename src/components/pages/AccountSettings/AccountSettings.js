import { Switch, Route } from 'react-router-dom'

import { useBaseUrl } from 'shared/router'

import SideMenu from './SideMenu'
import AdminTab from './tabs/Admin'
import BillingAndUsersTab from './tabs/BillingAndUsers'
import YAMLTab from './tabs/YAML'

function AccountSettings() {
  const baseUrl = useBaseUrl()

  // it's a slightly different menu / pages if the owner is a Org or a user
  // so we will need to fetch the information at this level
  // and render different UI according to the type of user

  return (
    <div className="flex space-between">
      <div className="mr-8">
        <SideMenu baseUrl={baseUrl} />
      </div>
      <div className="flex-grow ">
        <Switch>
          <Route path={baseUrl + ''} exact>
            <BillingAndUsersTab />
          </Route>
          <Route path={baseUrl + 'yaml'}>
            <YAMLTab />
          </Route>
          <Route path={baseUrl + 'admin'}>
            <AdminTab />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default AccountSettings
