import * as Sentry from '@sentry/react'
import { FallbackRender } from '@sentry/react'
import PropTypes from 'prop-types'
import { Fragment, ReactElement, ReactNode } from 'react'

import A from 'ui/A'

function DefaultUI() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p>
        There&apos;s been an error. Please try refreshing your browser, if this
        error persists please{' '}
        {/* @ts-expect-error ignore until we can convert A component to ts */}
        <A to={{ pageName: 'support' }} variant="link">
          contact support
        </A>
        .
      </p>
    </div>
  )
}

interface ErrorBoundaryProps {
  sentryScopes?: [string, string][]
  errorComponent?: ReactElement | FallbackRender | undefined
  children: ReactNode
}

export default function ErrorBoundary({
  sentryScopes = [],
  errorComponent = DefaultUI,
  children,
}: ErrorBoundaryProps) {
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

export const EmptyErrorComponent = () => <Fragment />

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  errorComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  sentryScopes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)), // https://docs.sentry.io/platforms/javascript/guides/react/components/errorboundary/#using-multiple-error-boundaries
}
