import { Suspense, lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import LogoSpinner from 'components/LogoSpinner'
import ErrorBoundary from 'components/ErrorBoundary'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))

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
    <ErrorBoundary>
      <Suspense fallback={fullPageLoader}>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <BrowserRouter>
            <Switch>
              <Route path="/account/:provider/:owner/">
                <AccountSettings />
              </Route>
            </Switch>
          </BrowserRouter>
        </ReactQueryCacheProvider>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
