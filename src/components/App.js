import { Suspense, lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import LogoSpinner from 'components/LogoSpinner'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))
const CancelPlan = lazy(() => import('./pages/CancelPlan'))

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      suspense: true,
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
    <Suspense fallback={fullPageLoader}>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <BrowserRouter>
          <Switch>
            <Route path="/account/:provider/:owner/billing/cancel">
              <CancelPlan />
            </Route>
            <Route path="/account/:provider/:owner/">
              <AccountSettings />
            </Route>
          </Switch>
        </BrowserRouter>
      </ReactQueryCacheProvider>
    </Suspense>
  )
}

export default App
