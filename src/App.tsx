import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import BaseLayout from 'layouts/BaseLayout'
import EnterpriseLoginLayout from 'layouts/EnterpriseLoginLayout'
import LoginLayout from 'layouts/LoginLayout'
import { useLocationParams } from 'services/navigation'
import { ToastNotificationProvider } from 'services/toastNotification'
import { useInternalUser, useUser } from 'services/user'
import { isProvider } from 'shared/api/helpers'
import 'ui/Table/Table.css'
import 'ui/FileList/FileList.css'
import { ThemeContextProvider } from 'shared/ThemeContext'

import AccountSettings from './pages/AccountSettings'
import AdminSettings from './pages/AdminSettings'
import { OnboardingContainerProvider } from './pages/OwnerPage/OnboardingContainerContext/context'
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CodecovAIPage = lazy(() => import('./pages/CodecovAIPage'))
const CommitDetailPage = lazy(() => import('./pages/CommitDetailPage'))
const EnterpriseLandingPage = lazy(() => import('pages/EnterpriseLandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MembersPage = lazy(() => import('./pages/MembersPage'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const OwnerPage = lazy(() => import('./pages/OwnerPage'))
const PullRequestPage = lazy(() => import('./pages/PullRequestPage'))
const RepoPage = lazy(() => import('./pages/RepoPage'))
const SyncProviderPage = lazy(() => import('./pages/SyncProviderPage'))

interface URLParams {
  provider: string
}

const HomePageRedirect = () => {
  const { provider } = useParams<URLParams>()
  const { data: currentUser } = useUser()
  const { data: internalUser } = useInternalUser({})
  const { params } = useLocationParams()
  const { setup_action: setupAction, to } = params

  let redirectURL = '/login'

  if (internalUser && internalUser.owners) {
    redirectURL = `/${internalUser.owners[0]?.service}/${internalUser.owners[0]?.username}`
    if (to === 'plan') {
      redirectURL = '/plan' + redirectURL
    }
  }

  if (provider && isProvider(provider) && currentUser) {
    const defaultOrg =
      currentUser.owner?.defaultOrgUsername ?? currentUser.user?.username
    redirectURL = `/${provider}/${defaultOrg}`

    if (setupAction) {
      redirectURL += `?setup_action=${setupAction}`
    }
  }

  return <Redirect to={redirectURL} />
}

const MainAppRoutes = () => (
  <Switch>
    <SentryRoute path="/login/:provider">
      <LoginLayout>
        {config.IS_SELF_HOSTED ? <Redirect to="/" /> : <LoginPage />}
      </LoginLayout>
    </SentryRoute>
    <SentryRoute path="/login">
      <LoginLayout>
        {config.IS_SELF_HOSTED ? <Redirect to="/" /> : <LoginPage />}
      </LoginLayout>
    </SentryRoute>
    <SentryRoute path="/account/:provider/:owner">
      <BaseLayout>
        <AccountSettings />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/sync" exact>
      <BaseLayout>
        <SyncProviderPage />
      </BaseLayout>
    </SentryRoute>
    {config.IS_SELF_HOSTED && (
      <SentryRoute path="/admin/:provider">
        <BaseLayout>
          <AdminSettings />
        </BaseLayout>
      </SentryRoute>
    )}
    {!config.IS_SELF_HOSTED && (
      <SentryRoute path="/plan/:provider" exact>
        <BaseLayout>
          <HomePageRedirect />
        </BaseLayout>
      </SentryRoute>
    )}
    {!config.IS_SELF_HOSTED && (
      <SentryRoute path="/plan/:provider/:owner">
        <BaseLayout>
          <PlanPage />
        </BaseLayout>
      </SentryRoute>
    )}
    {!config.IS_SELF_HOSTED && (
      <SentryRoute path="/members/:provider/:owner">
        <BaseLayout>
          <MembersPage />
        </BaseLayout>
      </SentryRoute>
    )}
    <SentryRoute path="/analytics/:provider/:owner" exact>
      <BaseLayout>
        <AnalyticsPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/codecovai/:provider/:owner" exact>
      <BaseLayout>
        <CodecovAIPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider" exact>
      <BaseLayout>
        <HomePageRedirect />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider/:owner" exact>
      <BaseLayout>
        <OwnerPage />
      </BaseLayout>
    </SentryRoute>
    <Redirect
      from="/:provider/:owner/:repo/compare/*"
      to="/:provider/:owner/:repo/pull/*"
    />
    <SentryRoute path="/:provider/:owner/:repo/pull/:pullId/tree/:path+" exact>
      <BaseLayout>
        <PullRequestPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider/:owner/:repo/pull/:pullId">
      <BaseLayout>
        <PullRequestPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider/:owner/:repo/commit/:commit/:path+" exact>
      <BaseLayout>
        <CommitDetailPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider/:owner/:repo/commit/:commit" exact>
      <BaseLayout>
        <CommitDetailPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute
      path={[
        '/:provider/:owner/:repo/commits/:branch',
        '/:provider/:owner/:repo/tree/:branch',
        '/:provider/:owner/:repo/flags/:branch',
        '/:provider/:owner/:repo/components/:branch',
        '/:provider/:owner/:repo/bundles/:branch',
        '/:provider/:owner/:repo/tests/:branch',
        // paths above are for grabbing branch for components in tree between here and RepoPage
        // where there is another set of SentryRoute matching
        '/:provider/:owner/:repo',
      ]}
    >
      <BaseLayout>
        <RepoPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/" exact>
      {config.IS_SELF_HOSTED ? (
        <EnterpriseLoginLayout>
          <EnterpriseLandingPage />
        </EnterpriseLoginLayout>
      ) : (
        <HomePageRedirect />
      )}
    </SentryRoute>
    <SentryRoute path="*">
      <HomePageRedirect />
    </SentryRoute>
  </Switch>
)

function App() {
  return (
    <>
      <ThemeContextProvider>
        <ToastNotificationProvider>
          <OnboardingContainerProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <MainAppRoutes />
          </OnboardingContainerProvider>
        </ToastNotificationProvider>
        <Toaster />
      </ThemeContextProvider>
    </>
  )
}

export default App
