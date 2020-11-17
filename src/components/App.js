import { Suspense, lazy } from 'react'

import { BrowserRouter, Switch, Route } from 'react-router-dom'

const AccountSettings = lazy(() => import('./pages/AccountSettings'))

function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserRouter>
        <Switch>
          <Route path="/account/:provider/:owner/">
            <AccountSettings />
          </Route>
        </Switch>
      </BrowserRouter>
    </Suspense>
  )
}

export default App
