import { Suspense, lazy } from 'react'
import * as Sentry from '@sentry/react'

import { BrowserRouter, Switch, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
      <Suspense fallback="loading...">
        <BrowserRouter>
          <Switch>
            <Route path="/about">
              <About />
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
