import { Suspense, lazy } from 'react'
import * as Sentry from '@sentry/react'

import { BrowserRouter, Switch, Route } from 'react-router-dom'
import 'sentry.js'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const BreakingPage = lazy(() => import('./pages/BreakingPage'))

function FallbackComponent() {
  return <div>An error has occurred</div>
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={FallbackComponent}>
      <Suspense fallback="loading...">
        <BrowserRouter>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/breaking">
              <Home />
            </Route>
            <Route path="/">
              <BreakingPage />
            </Route>
          </Switch>
        </BrowserRouter>
      </Suspense>
    </Sentry.ErrorBoundary>
  )
}

export default App
