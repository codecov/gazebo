import { Switch, Route } from 'react-router-dom'

import { useBaseUrl } from 'shared/router'

import SideMenu from './SideMenu'

function AccountSettings() {
  const baseUrl = useBaseUrl()

  // it's a slightly different menu / pages if the owner is a Org or a user
  // so we will need to fetch the information at this level
  // and render different UI according to the type of user

  return (
    <>
      <div>
        <SideMenu baseUrl={baseUrl} />
      </div>
      <div>
        <Switch>
          <Route path={baseUrl + ''}>Billing & Users</Route>
          <Route path={baseUrl + 'yaml'}>YAML</Route>
          <Route path={baseUrl + 'admin'}>Admin</Route>
        </Switch>
      </div>
    </>
  )
}

export default AccountSettings
