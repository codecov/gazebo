import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import SidebarLayout from 'layouts/SidebarLayout'
import { usePlanData } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { isEnterprisePlan } from 'shared/utils/billing'
import LoadingLogo from 'ui/LoadingLogo'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'
import Header from './shared/Header'

const AccessTab = lazy(() => import('./tabs/Access'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const NotFound = lazy(() => import('../NotFound'))
const OrgUploadToken = lazy(() => import('./tabs/OrgUploadToken'))
const Profile = lazy(() => import('./tabs/Profile'))
const YAMLTab = lazy(() => import('./tabs/YAML'))
const OktaAccess = lazy(() => import('./tabs/OktaAccess'))

const Loader = () => (
  <div className="flex items-center justify-center">
    <LoadingLogo />
  </div>
)

function AccountSettings() {
  const { provider, owner } = useParams()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { data: currentUser } = useUser()

  const { data } = usePlanData({ provider, owner })
  const viewOktaAccess = isEnterprisePlan(data?.plan?.value)

  const isViewingPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  return (
    <div className="flex flex-col gap-4">
      <Header />
      <SidebarLayout sidebar={<AccountSettingsSideMenu />}>
        <Suspense fallback={<Loader />}>
          <Switch>
            <SentryRoute path="/account/:provider/:owner/" exact>
              {config.IS_SELF_HOSTED && isViewingPersonalSettings ? (
                <Profile provider={provider} owner={owner} />
              ) : !config.IS_SELF_HOSTED && isAdmin ? (
                <AdminTab />
              ) : (
                <Redirect to={`/account/${provider}/${owner}/yaml/`} />
              )}
            </SentryRoute>
            {viewOktaAccess ? (
              <SentryRoute path="/account/:provider/:owner/okta-access/" exact>
                <OktaAccess />
              </SentryRoute>
            ) : null}
            <SentryRoute path="/account/:provider/:owner/yaml/" exact>
              <YAMLTab provider={provider} owner={owner} />
            </SentryRoute>
            {(!config.IS_SELF_HOSTED || !config.HIDE_ACCESS_TAB) && (
              <SentryRoute path="/account/:provider/:owner/access/" exact>
                <AccessTab />
              </SentryRoute>
            )}
            <SentryRoute
              path="/account/:provider/:owner/org-upload-token"
              exact
            >
              {isAdmin ? (
                <OrgUploadToken />
              ) : (
                <Redirect to={`/account/${provider}/${owner}/yaml/`} />
              )}
            </SentryRoute>
            <SentryRoute path="/account/:provider/:owner/*">
              <NotFound />
            </SentryRoute>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </div>
  )
}

export default AccountSettings
