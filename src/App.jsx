import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'

import config from 'config'

import BaseLayout from 'layouts/BaseLayout'
// not lazy loading because is first page user sees
import { ToastNotificationProvider } from 'services/toastNotification'
import { useUTM } from 'services/tracking/utm'
import { ThemeContextProvider } from 'shared/ThemeContext'

// Not lazy loading because the page is very small and is accessed often

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

// eslint-disable-next-line complexity
function App() {
  useUTM()

  return (
    <ToastNotificationProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <ThemeContextProvider>
          <BrowserRouter>
            <Switch>
              <Route path="/login/:provider">
                <BaseLayout>
                  {config.IS_ENTERPRISE ? <Redirect to="/" /> : <LoginPage />}
                </BaseLayout>
              </Route>
              <Route path="/login">
                <BaseLayout>
                  {config.IS_ENTERPRISE ? <Redirect to="/" /> : <LoginPage />}
                </BaseLayout>
              </Route>
              <Route path="/account/:provider/:owner/">
                <BaseLayout>
                  <AccountSettings />
                </BaseLayout>
              </Route>
              {config.IS_ENTERPRISE && (
                <Route path="/admin/:provider">
                  <BaseLayout>
                    <AdminSettings />
                  </BaseLayout>
                </Route>
              )}
              <Route path="/analytics/:provider/:owner/" exact>
                <BaseLayout>
                  <AnalyticsPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/feedback">
                <BaseLayout>
                  <FeedbackPage />
                </BaseLayout>
              </Route>
              <Route path="/members/:provider/:owner/">
                <BaseLayout>
                  <MembersPage />
                </BaseLayout>
              </Route>
              <Route path="/plan/:provider/:owner/">
                <BaseLayout>
                  <PlanPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/+" exact>
                <BaseLayout>
                  <HomePage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/" exact>
                <BaseLayout>
                  <HomePage active={true} />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/" exact>
                <BaseLayout>
                  <OwnerPage active={true} />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/+" exact>
                <BaseLayout>
                  <OwnerPage />
                </BaseLayout>
              </Route>
              <Redirect
                from="/:provider/:owner/:repo/compare/*"
                to="/:provider/:owner/:repo/pull/*"
              />
              <Route
                path="/:provider/:owner/:repo/pull/:pullId/tree/:path+"
                exact
              >
                <BaseLayout>
                  <PullRequestPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/:repo/pull/:pullId">
                <BaseLayout>
                  <PullRequestPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/:repo/commit/:commit/:path+" exact>
                <BaseLayout>
                  <CommitPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/:repo/commit/:commit" exact>
                <BaseLayout>
                  <CommitPage />
                </BaseLayout>
              </Route>
              <Route path="/:provider/:owner/:repo">
                <BaseLayout>
                  <RepoPage />
                </BaseLayout>
              </Route>
              <Route path="/">
                {config.IS_ENTERPRISE ? (
                  <BaseLayout>
                    <EnterpriseLandingPage />
                  </BaseLayout>
                ) : (
                  <Redirect to="/gh" />
                )}
              </Route>
            </Switch>
          </BrowserRouter>
        </ThemeContextProvider>
      </QueryClientProvider>
    </ToastNotificationProvider>
  )
}

export default App
