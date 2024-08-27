import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserHistory } from 'history'
import Cookies from 'js-cookie'
import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactModal from 'react-modal'
import { Router } from 'react-router-dom'
import { CompatRouter } from 'react-router-dom-v5-compat'

import config, {
  COOKIE_SESSION_EXPIRY,
  LOCAL_STORAGE_SESION_EXPIRED_KEY,
  LOCAL_STORAGE_SESSION_TRACKING_KEY,
} from 'config'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { withFeatureFlagProvider } from 'shared/featureFlags'
import { metrics } from 'shared/utils/metrics'

import App from './App'
import './globals.css'
import { setupSentry } from './sentry'

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

const TOO_MANY_REQUESTS_ERROR_CODE = 429

setupSentry({ history })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: (failureCount, error) => {
        // Do not retry if the response status is 429
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          error.status === TOO_MANY_REQUESTS_ERROR_CODE
        ) {
          return false
        }
        // Otherwise, retry up to 3 times
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
})

if (Cookies.get(COOKIE_SESSION_EXPIRY)) {
  localStorage.removeItem(LOCAL_STORAGE_SESION_EXPIRED_KEY)
  localStorage.removeItem(LOCAL_STORAGE_SESSION_TRACKING_KEY)
  Cookies.remove(COOKIE_SESSION_EXPIRY, {
    path: '/',
    domain: `.${(config.BASE_URL as string).split('/')[2]}`,
  }) // Remove http(s)://
  metrics.increment('old_session_expiry.cleanup')
}

const domNode = document.getElementById('root')

if (!domNode) {
  throw new Error('No root element found')
}

const root = createRoot(domNode)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router history={history}>
          <CompatRouter>
            <ProfiledApp />
          </CompatRouter>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
