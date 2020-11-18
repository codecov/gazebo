import { Suspense, lazy } from 'react'
import { QueryCache, ReactQueryCacheProvider } from 'react-query'

import { BrowserRouter, Switch, Route } from 'react-router-dom'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))

const queryCache = new QueryCache({
  defaultConfig: {
    queries: {
      suspense: true,
    },
  },
})

function App() {
  return (
    <Suspense fallback="loading...">
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
  )
}

export default App
