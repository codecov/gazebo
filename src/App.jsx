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
const CommitDetailPage = lazy(() => import('./pages/CommitDetailPage'))
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

// eslint-disable-next-line complexity
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
          {!config.IS_SELF_HOSTED && (
            <SentryRoute path="/plan/:provider/:owner/">
              <BaseLayout>
                <PlanPage />
              </BaseLayout>
            </SentryRoute>
          )}
          {!config.IS_SELF_HOSTED && (
            <SentryRoute path="/members/:provider/:owner/">
              <BaseLayout>
                <MembersPage />
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
          <SentryRoute path="/:provider/" exact>
            <BaseLayout>
              <HomePage />
            </BaseLayout>
          </SentryRoute>
          <Redirect
            from="/:provider/+"
            exact
            to="/:provider\?repoDisplay=Inactive"
          />
          <SentryRoute path="/:provider/:owner/" exact>
            <BaseLayout>
              <OwnerPage />
            </BaseLayout>
          </SentryRoute>
          <Redirect
            from="/:provider/:owner/+"
            exact
            to="/:provider/:owner\?repoDisplay=Inactive"
          />
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
