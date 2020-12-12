import { lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { ToastNotificationProvider } from 'services/toastNotification'
import BaseLayout from 'layouts/BaseLayout'
import config from 'config'

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

const stripePromise = loadStripe(config.STRIPE_KEY)

function App() {
  return (
  <Elements stripe={stripePromise}>
    <ToastNotificationProvider>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <BrowserRouter>
          <Switch>
            <Route path="/account/:provider/:owner/">
              <BaseLayout>
                <AccountSettings />
              </BaseLayout>
            </Route>
            <Route path="/:provider/" exact>
              <BaseLayout>
                <FullLayout>List of organizations</FullLayout>
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/" exact>
              <BaseLayout>
                <FullLayout>List of repos</FullLayout>
              </BaseLayout>
            </Route>
            <Route path="/:provider/:owner/:repo/" exact>
              <BaseLayout>
                <FullLayout>Repo page</FullLayout>
              </BaseLayout>
            </Route>
            <Route path="/">
              <BaseLayout>
                <FullLayout>
                  <p>Home page</p>
                </FullLayout>
              </BaseLayout>
            </Route>
          </Switch>
        </BrowserRouter>
      </ReactQueryCacheProvider>
    </ToastNotificationProvider>
  </Elements>
  )
}

export default App
