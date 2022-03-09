import * as Sentry from '@sentry/react'
import PropTypes from 'prop-types'

import A from 'ui/A'

function DefaultUI() {
  return (
    <p>
      There&apos;s been an error. Please try refreshing your browser, if this
      error persists please{' '}
      <A to={{ pageName: 'support' }} variant="link">
        contact support
      </A>
      .
    </p>
  )
}

export default function ErrorBoundary({
  sentryScopes = [],
  errorComponent = DefaultUI,
  children,
}) {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) =>
        sentryScopes.forEach(([key, value]) => scope.setTag(key, value))
      }
      fallback={errorComponent}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  errorComponent: PropTypes.element,
  sentryScopes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)), // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
}
