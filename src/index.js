import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'

import ErrorBoundary from 'layouts/shared/ErrorBoundary'

import App from './App'
import './globals.css'
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

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
