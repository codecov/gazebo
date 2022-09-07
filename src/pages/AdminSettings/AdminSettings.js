import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useSelfHostedCurrentUser } from 'services/selfHosted'
import Spinner from 'ui/Spinner'

import AdminSettingsHeader from './AdminSettingsHeader'
import AdminSettingsSidebar from './AdminSettingsSidebar'

const AdminAccess = lazy(() => import('./AdminAccess'))

const Loader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

const SpinnerLoader = (
  <div className="flex-1 flex items-center justify-center mt-16">
    <Spinner />
  </div>
)

function AdminSettings() {
  const { provider } = useParams()
  const { data, isLoading } = useSelfHostedCurrentUser()

  const redirectTo = `/admin/${provider}/access`

  return (
    <Suspense fallback={Loader}>
      {data?.isAdmin ? (
        <>
          <AdminSettingsHeader />
          <SidebarLayout sidebar={<AdminSettingsSidebar />}>
            <Suspense fallback={SpinnerLoader}>
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
      ) : (
        !isLoading && <Redirect to={`/${provider}`} />
      )}
    </Suspense>
  )
}

export default AdminSettings
