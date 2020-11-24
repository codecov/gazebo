import PropTypes from 'prop-types'
import * as Sentry from '@sentry/react'

function DefaultUI() {
  return <p>Well this is embarassing, looks like we had an error.</p>
}

export default function ErrorBoundary({
  scopeFn,
  errorComponent = DefaultUI,
  children,
}) {
  return (
    <Sentry.ErrorBoundary beforeCapture={scopeFn} fallback={errorComponent}>
      {children}
    </Sentry.ErrorBoundary>
  )
}
ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  errorComponent: PropTypes.element,
  scopeFn: PropTypes.func, // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
}
