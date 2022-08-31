import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'

import AdminSettingsHeader from './AdminSettingsHeader'
import AdminSettingsSidebar from './AdminSettingsSidebar'

const AdminAccess = lazy(() => import('./AdminAccess'))

const Loader = () => (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

function AdminSettings() {
  const { provider } = useParams()

  const redirectTo = `/admin/${provider}/access`

  return (
    <>
      <AdminSettingsHeader />
      <SidebarLayout sidebar={<AdminSettingsSidebar />}>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/admin/:provider/access" exact>
              <AdminAccess />
            </Route>
            <Route path="/admin/:provider/users" exact>
              <p>{provider} users</p>
            </Route>
            <Route path="/admin/:provider">
              <Redirect to={redirectTo} />
            </Route>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </>
  )
}

export default AdminSettings
