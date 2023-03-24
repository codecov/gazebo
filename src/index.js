import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserHistory } from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { Router } from 'react-router-dom'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { withFeatureFlagProvider } from 'shared/featureFlags'

import App from './App'
import './globals.css'
import reportWebVitals from './reportWebVitals'
import { setupSentry } from './sentry.js'

if (
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_MSW_BROWSER
) {
  const { worker } = require('./mocks/browser')
  worker.start()
}

ReactModal.setAppElement('#root')

// use with pattern to not block app loading.
const FeatureFlagApp = withFeatureFlagProvider(App)

const ProfiledApp = Sentry.withProfiler(FeatureFlagApp)

const history = createBrowserHistory()

setupSentry({ history })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <ProfiledApp />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
