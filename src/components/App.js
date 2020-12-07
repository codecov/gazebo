import { Suspense, lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import LogoSpinner from 'components/LogoSpinner'
import Footer from 'components/Footer'
import ToastNotifications from 'components/ToastNotifications'
import { ToastNotificationProvider } from 'services/toastNotification'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))

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
    <div className="h-screen w-screen flex items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <ToastNotificationProvider>
      <Suspense fallback={fullPageLoader}>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <BrowserRouter>
            <Switch>
              <Route path="/account/:provider/:owner/">
                <AccountSettings />
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
