import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { SelfHostedCurrentUserQueryOpts } from 'services/selfHosted/SelfHostedCurrentUserQueryOpts'
import LoadingLogo from 'ui/LoadingLogo'
import Spinner from 'ui/Spinner'

import AdminAccess from './AdminAccess'
import AdminMembers from './AdminMembers'
import AdminSettingsSidebar from './AdminSettingsSidebar'

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
  const { data, isLoading } = useSuspenseQueryV5(
    SelfHostedCurrentUserQueryOpts({ provider })
  )

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
