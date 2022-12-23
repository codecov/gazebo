import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import config from 'config'

import { SentryRoute } from 'sentry'

import BaseLayout from 'layouts/BaseLayout'
// not lazy loading because is first page user sees
import { ToastNotificationProvider } from 'services/toastNotification'
import { useUTM } from 'services/tracking/utm'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CommitPage = lazy(() => import('./pages/CommitPage'))
const EnterpriseLandingPage = lazy(() => import('pages/EnterpriseLandingPage'))
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MembersPage = lazy(() => import('./pages/MembersPage/MembersPage'))
const PlanPage = lazy(() => import('./pages/PlanPage/PlanPage'))
const OwnerPage = lazy(() => import('./pages/OwnerPage'))
const PullRequestPage = lazy(() => import('./pages/PullRequestPage'))
const RepoPage = lazy(() => import('./pages/RepoPage/RepoPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  useUTM()

  return (
    <ToastNotificationProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
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
          <SentryRoute path="/account/:provider/:owner/">
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
          <SentryRoute path="/analytics/:provider/:owner/" exact>
            <BaseLayout>
              <AnalyticsPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/feedback">
            <BaseLayout>
              <FeedbackPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/members/:provider/:owner/">
            <BaseLayout>
              <MembersPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/plan/:provider/:owner/">
            <BaseLayout>
              <PlanPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider" exact>
            <BaseLayout>
              <HomePage repoDisplay="All" />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/inactive" exact>
            <BaseLayout>
              <HomePage repoDisplay="Inactive" />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/active" exact>
            <BaseLayout>
              <HomePage repoDisplay="Active" />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/" exact>
            <BaseLayout>
              <OwnerPage repoDisplay="All" />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/inactive" exact>
            <BaseLayout>
              <OwnerPage repoDisplay="Inactive" />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/active" exact>
            <BaseLayout>
              <OwnerPage repoDisplay="Active" />
            </BaseLayout>
          </SentryRoute>
          <Redirect
            from="/:provider/:owner/:repo/compare/*"
            to="/:provider/:owner/:repo/pull/*"
          />
          <SentryRoute
            path="/:provider/:owner/:repo/pull/:pullId/tree/:path+"
            exact
          >
            <BaseLayout>
              <PullRequestPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/pull/:pullId">
            <BaseLayout>
              <PullRequestPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute
            path="/:provider/:owner/:repo/commit/:commit/:path+"
            exact
          >
            <BaseLayout>
              <CommitPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/commit/:commit" exact>
            <BaseLayout>
              <CommitPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo">
            <BaseLayout>
              <RepoPage />
            </BaseLayout>
          </SentryRoute>
          <SentryRoute path="/">
            {config.IS_SELF_HOSTED ? (
              <BaseLayout>
                <EnterpriseLandingPage />
              </BaseLayout>
            ) : (
              <Redirect to="/gh" />
            )}
          </SentryRoute>
        </Switch>
      </QueryClientProvider>
    </ToastNotificationProvider>
  )
}

export default App
