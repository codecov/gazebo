import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { Redirect, Switch, useParams } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import BaseLayout from 'layouts/BaseLayout'
import LoginLayout from 'layouts/LoginLayout'
import { useUpdateDefaultOrganization } from 'services/defaultOrganization'
import { useLocationParams } from 'services/navigation'
import { ToastNotificationProvider } from 'services/toastNotification'
import { useUTM } from 'services/tracking/utm'
import { useUser } from 'services/user'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CommitDetailPage = lazy(() => import('./pages/CommitDetailPage'))
const EnterpriseLandingPage = lazy(() => import('pages/EnterpriseLandingPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MembersPage = lazy(() => import('./pages/MembersPage'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const OwnerPage = lazy(() => import('./pages/OwnerPage'))
const PullRequestPage = lazy(() => import('./pages/PullRequestPage'))
const RepoPage = lazy(() => import('./pages/RepoPage'))

const SetUpActions = Object.freeze({
  INSTALL: 'install',
  REQUEST: 'request',
})

// eslint-disable-next-line max-statements, complexity
const HomePageRedirect = () => {
  const { provider } = useParams()
  const { data: currentUser } = useUser()

  const { params } = useLocationParams()
  const { mutate: updateDefaultOrg } = useUpdateDefaultOrganization()

  if (!provider || !currentUser) return <Redirect to="/login" />

  const defaultOrg =
    currentUser?.owner?.defaultOrgUsername ?? currentUser?.user?.username

  const { setup_action: setupAction } = params

  if (setupAction === SetUpActions.INSTALL) return

  if (setupAction === SetUpActions.REQUEST) {
    updateDefaultOrg({ username: defaultOrg })

    return (
      <Redirect
        to={{
          pathname: `/${provider}/${defaultOrg}`,
          search: `?setup_action=${SetUpActions.REQUEST}`,
        }}
      />
    )
  }

  return <Redirect to={`/${provider}/${defaultOrg}`} />
}

// eslint-disable-next-line complexity
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
    <SentryRoute path="/:provider" exact>
      <BaseLayout>
        <HomePageRedirect />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider/feedback">
      <BaseLayout>
        <FeedbackPage />
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
    <SentryRoute path="/:provider/:owner/:repo">
      <BaseLayout>
        <RepoPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/" exact>
      {config.IS_SELF_HOSTED ? (
        <BaseLayout>
          <EnterpriseLandingPage />
        </BaseLayout>
      ) : (
        <Redirect to="/login/gh" />
      )}
    </SentryRoute>
    <SentryRoute path="*">
      <HomePageRedirect />
    </SentryRoute>
  </Switch>
)

function App() {
  useUTM()

  return (
    <>
      <ToastNotificationProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <MainAppRoutes />
      </ToastNotificationProvider>
      <Toaster />
    </>
  )
}

export default App
