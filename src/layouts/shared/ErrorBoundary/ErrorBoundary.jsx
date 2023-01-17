import * as Sentry from '@sentry/react'
import PropTypes from 'prop-types'

import A from 'ui/A'

function DefaultUI() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <p>
        There&apos;s been an error. Please try refreshing your browser, if this
        error persists please{' '}
        <A to={{ pageName: 'support' }} variant="link">
          contact support
        </A>
        .
      </p>
    </div>
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
  errorComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  sentryScopes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)), // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
}
