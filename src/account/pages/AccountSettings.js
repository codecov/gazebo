import { Switch, Route, useRouteMatch } from 'react-router-dom'

import SideMenu from './SideMenu'

function AccountSettings() {
  const routeMatch = useRouteMatch()
  const baseUrl = routeMatch.url.endsWith('/')
    ? routeMatch.url
    : routeMatch.url + '/'

  return (
    <>
      <div>
        <SideMenu baseUrl={baseUrl} />
      </div>
      <div>
        <Switch>
          <Route path={baseUrl + 'billing'}>billing</Route>
          <Route path={baseUrl + 'users'}>Users</Route>
          <Route path={baseUrl + 'invoices'}>invoices</Route>
          <Route path={baseUrl + 'yaml/history'}>yaml history</Route>
          <Route path={baseUrl + 'yaml'}>yaml</Route>
          <Route path="">General</Route>
        </Switch>
      </div>
    </>
  )
}

export default AccountSettings
