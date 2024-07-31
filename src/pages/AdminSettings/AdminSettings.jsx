import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { useSelfHostedCurrentUser } from 'services/selfHosted'
import LoadingLogo from 'ui/LoadingLogo'
import Spinner from 'ui/Spinner'

import AdminSettingsSidebar from './AdminSettingsSidebar'

const AdminAccess = lazy(() => import('./AdminAccess'))
const AdminMembers = lazy(() => import('./AdminMembers'))

const Loader = (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const SpinnerLoader = (
  <div className="mt-16 flex flex-1 items-center justify-center">
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
          <SidebarLayout sidebar={<AdminSettingsSidebar />}>
            <Suspense fallback={SpinnerLoader}>
              <Switch>
                <SentryRoute path="/admin/:provider/access" exact>
                  <AdminAccess />
                </SentryRoute>
                <SentryRoute path="/admin/:provider/users" exact>
                  <AdminMembers />
                </SentryRoute>
                <SentryRoute path="/admin/:provider">
                  <Redirect to={redirectTo} />
                </SentryRoute>
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
