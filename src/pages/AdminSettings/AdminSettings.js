import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import SidebarLayout from 'layouts/SidebarLayout'

import AdminSettingsHeader from './AdminSettingsHeader'
import AdminSettingsSidebar from './AdminSettingsSidebar'

function AdminSettings() {
  const { provider } = useParams()

  const redirectTo = `/admin/${provider}/access`

  return (
    <>
      <AdminSettingsHeader />
      <SidebarLayout sidebar={<AdminSettingsSidebar />}>
        <Switch>
          <Route path="/admin/:provider/access" exact>
            <p>{provider} access</p>
          </Route>
          <Route path="/admin/:provider/users" exact>
            <p>{provider} users</p>
          </Route>
          <Route path="/admin/:provider">
            <Redirect to={redirectTo} />
          </Route>
        </Switch>
      </SidebarLayout>
    </>
  )
}

export default AdminSettings
