import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import config from 'config'

import SidebarLayout from 'layouts/SidebarLayout'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'
import Header from './shared/Header'

const AccessTab = lazy(() => import('./tabs/Access'))
const AdminTab = lazy(() => import('./tabs/Admin'))
const NotFound = lazy(() => import('../NotFound'))
const Profile = lazy(() => import('./tabs/Profile'))
const YAMLTab = lazy(() => import('./tabs/YAML'))

const stripePromise = loadStripe(config.STRIPE_KEY)

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

  return (
    <Elements stripe={stripePromise}>
      <Header />
      <SidebarLayout sidebar={<AccountSettingsSideMenu />}>
        <Suspense fallback={Loader}>
          <Switch>
            <Route path="/account/:provider/:owner/" exact>
              {config.IS_ENTERPRISE && isViewingPersonalSettings ? (
                <Profile />
              ) : !config.IS_ENTERPRISE && isAdmin ? (
                <AdminTab provider={provider} owner={owner} />
              ) : (
                <Redirect to={yamlTab} />
              )}
            </Route>
            <Route path="/account/:provider/:owner/yaml/" exact>
              <YAMLTab provider={provider} owner={owner} />
            </Route>
            {!config.IS_ENTERPRISE && (
              <Route path="/account/:provider/:owner/access/" exact>
                <AccessTab provider={provider} />
              </Route>
            )}
            <Route path="/account/:provider/:owner/*">
              <NotFound />
            </Route>
          </Switch>
        </Suspense>
      </SidebarLayout>
    </Elements>
  )
}

export default AccountSettings
