import * as Sentry from '@sentry/react'
import { FallbackRender } from '@sentry/react'
import PropTypes from 'prop-types'
import { Fragment, ReactElement, ReactNode } from 'react'

import A from 'ui/A'

const CHUNK_RELOAD_KEY = 'chunk-reload-attempted'

function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === 'ChunkLoadError') return true
  if (
    error.name === 'SyntaxError' &&
    error.message.includes('Invalid or unexpected token')
  )
    return true
  return false
}

function handleChunkLoadError(error: unknown): void {
  if (!isChunkLoadError(error)) return
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    // Already tried reloading once — clear the flag and let the error UI render
    sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    return
  }
  sessionStorage.setItem(CHUNK_RELOAD_KEY, 'true')
  window.location.reload()
}

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
      onError={(error) => handleChunkLoadError(error)}
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
