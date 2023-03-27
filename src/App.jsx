import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import BaseLayout from 'layouts/BaseLayout'
import LimitedLayout from 'layouts/LimitedLayout'
import { ToastNotificationProvider } from 'services/toastNotification'
import { useUTM } from 'services/tracking/utm'
// import { useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AllOrgsPlanPage = lazy(() => import('./pages/AllOrgsPlanPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CommitDetailPage = lazy(() => import('./pages/CommitDetailPage'))
const EnterpriseLandingPage = lazy(() => import('pages/EnterpriseLandingPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MembersPage = lazy(() => import('./pages/MembersPage'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const OwnerPage = lazy(() => import('./pages/OwnerPage'))
const PullRequestPage = lazy(() => import('./pages/PullRequestPage'))
const RepoPage = lazy(() => import('./pages/RepoPage'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))

const LimitedRoutes = () => (
  <Switch>
    <SentryRoute path="*">
      <LimitedLayout>
        <TermsOfService />
      </LimitedLayout>
    </SentryRoute>
  </Switch>
)

// eslint-disable-next-line complexity
const FullRoutes = () => (
  <Switch>
    <SentryRoute path="/login/:provider">
      <BaseLayout>
        {config.IS_SELF_HOSTED ? <Redirect to="/" /> : <LoginPage />}
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/login">
      <BaseLayout>
        {config.IS_SELF_HOSTED ? <Redirect to="/" /> : <LoginPage />}
      </BaseLayout>
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
      <SentryRoute path="/plan/:provider/:owner">
        <BaseLayout>
          <PlanPage />
        </BaseLayout>
      </SentryRoute>
    )}
    {!config.IS_SELF_HOSTED && (
      <SentryRoute path="/plan/:provider/" exact>
        <BaseLayout>
          <AllOrgsPlanPage />
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
    <SentryRoute path="/:provider/feedback">
      <BaseLayout>
        <FeedbackPage />
      </BaseLayout>
    </SentryRoute>
    <SentryRoute path="/:provider" exact>
      <BaseLayout>
        <HomePage />
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
        <Redirect to="/gh" />
      )}
    </SentryRoute>
  </Switch>
)

const useUserAccessGate = () => {
  const { termsOfServicePage } = useFlags({ termsOfServicePage: false })
  /*
    This isn't working because there's no provider at this point, need to redo this section
    but I'm trying to stick to updating the test suite first.
  */
  // const { ...all } = useUser({ suspense: false })
  // console.log('useUser', all)

  /*
    TODO - add logic to check if user has signed TOS when API is ready via the useUser hook.
    This value will be null for existing users, return true for new users, and false for users who have signed TOS.

    AKA old users and users who have signed TOS will see get full experience, guests will not be limited.
  */
  return {
    // isFullExperience: !termsOfServicePage && data?.termsAgreement !== false,
    isFullExperience: !termsOfServicePage || config.IS_SELF_HOSTED,
  }
}

function GazeboRootRoutes() {
  const { isFullExperience } = useUserAccessGate()

  if (isFullExperience) {
    return <FullRoutes />
  }

  return <LimitedRoutes />
}

function App() {
  useUTM()

  return (
    <ToastNotificationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <GazeboRootRoutes />
    </ToastNotificationProvider>
  )
}

export default App
