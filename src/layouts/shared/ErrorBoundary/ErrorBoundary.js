import PropTypes from 'prop-types'
import * as Sentry from '@sentry/react'

function DefaultUI() {
  return (
    <p className="container">
      Well this is embarassing, looks like there was an error.
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
