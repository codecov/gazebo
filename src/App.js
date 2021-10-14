import { lazy } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'

import { ToastNotificationProvider } from 'services/toastNotification'
import BaseLayout from 'layouts/BaseLayout'
import { ReactQueryDevtools } from 'react-query/devtools'
import RepoPage from 'pages/RepoPage/RepoPage'
// Not lazy loading because the page is very small and is accessed often

const LoginPage = lazy(() => import('./pages/LoginPage'))
const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const HomePage = lazy(() => import('./pages/HomePage'))
const CommitPage = lazy(() => import('./pages/CommitPage'))
const PullRequestPage = lazy(() => import('./pages/PullRequestPage'))
const FileViewPage = lazy(() => import('./pages/FileView'))
const OwnerPage = lazy(() => import('./pages/OwnerPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

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
            <Route path="/:provider/:owner/:repo/pull/:pullid" exact>
              <BaseLayout>
                <PullRequestPage />
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/commit/:commit/:path+" exact>
              <BaseLayout>
                <CommitPage />
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/commit/:commit/" exact>
              <BaseLayout>
                <CommitPage />
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/tree/*" exact>
              <BaseLayout>
                <p>Tree</p>
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/blob/:ref/*" exact>
              <BaseLayout>
                <FileViewPage />
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/">
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
