import { Suspense, lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import LogoSpinner from 'ui/LogoSpinner'
import Footer from 'ui/Footer'
import Header from 'ui/Header'
import ToastNotifications from 'ui/ToastNotifications'
import { ToastNotificationProvider } from 'services/toastNotification'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const FullLayout = lazy(() => import('./layouts/FullLayout'))

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})

function App() {
  const fullPageLoader = (
    <div className="h-screen w-screen flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <ToastNotificationProvider>
      <Suspense fallback={fullPageLoader}>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <BrowserRouter>
            <Header />
            <Switch>
              <Route path="/account/:provider/:owner/">
                <AccountSettings />
              </Route>
              <Route path="/">
                <FullLayout>
                  <p>Home page</p>
                </FullLayout>
              </Route>
            </Switch>
          </BrowserRouter>
          <Footer />
          <ToastNotifications />
        </ReactQueryCacheProvider>
      </Suspense>
    </ToastNotificationProvider>
  )
}

export default App
