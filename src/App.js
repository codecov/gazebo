import { lazy } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'

import BaseLayout from 'layouts/BaseLayout'
import { ToastNotificationProvider } from 'services/toastNotification'
import { useUTM } from 'services/tracking/utm'

// Not lazy loading because the page is very small and is accessed often

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const CommitPage = lazy(() => import('./pages/CommitPage'))
const FileViewPage = lazy(() => import('./pages/FileView'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
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
        <BrowserRouter>
          <Switch>
            <Route path="/login/:provider">
              <BaseLayout>
                <LoginPage />
              </BaseLayout>
            </Route>
            <Route path="/login">
              <BaseLayout>
                <LoginPage />
              </BaseLayout>
            </Route>
            <Route path="/account/:provider/:owner/">
              <BaseLayout>
                <AccountSettings />
              </BaseLayout>
            </Route>
            <Route path="/analytics/:provider/:owner/" exact>
              <BaseLayout>
                <AnalyticsPage />
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
            <Route path="/:provider/:owner/:repo/blob/:ref/:path+" exact>
              <BaseLayout>
                <FileViewPage />
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo">
              <BaseLayout>
                <RepoPage />
              </BaseLayout>
            </Route>
            <Route path="/">
              <Redirect to="/gh" />
            </Route>
          </Switch>
        </BrowserRouter>
      </QueryClientProvider>
    </ToastNotificationProvider>
  )
}

export default App
