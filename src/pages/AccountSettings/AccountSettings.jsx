import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import config from 'config'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useAccountDetails } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'
import { isEnterprisePlan } from 'shared/utils/billing'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'
import Header from './shared/Header'
import OrgUploadToken from './tabs/OrgUploadToken'

const AccessTab = lazy(() => import('./tabs/Access'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const NotFound = lazy(() => import('../NotFound'))
const Profile = lazy(() => import('./tabs/Profile'))
const YAMLTab = lazy(() => import('./tabs/YAML'))

const Loader = (
  <div className="h-full w-full flex items-center justify-center">
    <LogoSpinner />
  </div>
)

// eslint-disable-next-line complexity
function AccountSettings() {
  const { provider, owner } = useParams()
  const isAdmin = useIsCurrentUserAnAdmin({ owner })
  const { data: currentUser } = useUser()

  const isViewingPersonalSettings =
    currentUser?.user?.username?.toLowerCase() === owner?.toLowerCase()

  const yamlTab = `/account/${provider}/${owner}/yaml/`
  const { orgUploadToken } = useFlags({ orgUploadToken: false })

  const { data: accountDetails } = useAccountDetails({ owner, provider })
  const showOrgUploadToken =
    orgUploadToken && isEnterprisePlan(accountDetails?.plan?.value)

  return (
    <>
      <Header />
      <SidebarLayout sidebar={<AccountSettingsSideMenu />}>
        <Suspense fallback={Loader}>
          <Switch>
            <Route path="/account/:provider/:owner/" exact>
              {config.IS_SELF_HOSTED && isViewingPersonalSettings ? (
                <Profile provider={provider} owner={owner} />
              ) : !config.IS_SELF_HOSTED && isAdmin ? (
                <AdminTab provider={provider} owner={owner} />
              ) : (
                <Redirect to={yamlTab} />
              )}
            </Route>
            <Route path="/account/:provider/:owner/yaml/" exact>
              <YAMLTab provider={provider} owner={owner} />
            </Route>
            {!config.IS_SELF_HOSTED && (
              <Route path="/account/:provider/:owner/access/" exact>
                <AccessTab provider={provider} />
              </Route>
            )}
            {showOrgUploadToken && (
              <Route path="/account/:provider/:owner/orgUploadToken" exact>
                <OrgUploadToken />
              </Route>
            )}
            <Route path="/account/:provider/:owner/*">
              <NotFound />
            </Route>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </>
  )
}

export default AccountSettings
