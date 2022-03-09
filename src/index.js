import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { withFeatureFlagProvider } from 'shared/featureFlags'

import App from './App'
import './globals.css'
// TODO do not initialize 10 to 12 if enterprise.
import reportWebVitals from './reportWebVitals'
import './sentry.js'

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

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <FeatureFlagApp />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
