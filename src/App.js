import { Suspense, lazy } from 'react'
import * as Sentry from '@sentry/react'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import 'sentry.js'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const BreakingPage = lazy(() => import('./pages/BreakingPage'))

function App() {
  return (
    <Sentry.ErrorBoundary fallback={'An error has occured'}>
      <Suspense fallback="loading...">
        <BrowserRouter>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/breaking">
              <BreakingPage />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </BrowserRouter>
      </Suspense>
    </Sentry.ErrorBoundary>
  )
}

export default App
