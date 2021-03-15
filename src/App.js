import { lazy } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { ToastNotificationProvider } from 'services/toastNotification'
import BaseLayout from 'layouts/BaseLayout'
import config from 'config'
import { ReactQueryDevtools } from 'react-query/devtools'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const FullLayout = lazy(() => import('./layouts/FullLayout'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      staleTime: 30000, // 30s
    },
  },
})

const stripePromise = loadStripe(config.STRIPE_KEY)

function App() {
  return (
    <Elements stripe={stripePromise}>
      <ToastNotificationProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
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
        </QueryClientProvider>
      </ToastNotificationProvider>
    </Elements>
  )
}

export default App
