import { Component, Fragment, type ReactNode } from 'react'

const MAX_RETRIES = 2

/**
 * Detects DOM NotFoundErrors caused by browser extensions directly mutating
 * React-managed nodes (e.g. via insertBefore / removeChild). These errors are
 * non-actionable from the application side.
 */
function isBrowserExtensionDOMError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name !== 'NotFoundError') return false
  const msg = error.message ?? ''
  return msg.includes('insertBefore') || msg.includes('removeChild')
}

interface Props {
  children: ReactNode
}

interface State {
  retryKey: number
}

/**
 * Wraps children so that when a browser-extension-caused DOM manipulation error
 * is caught, the subtree is automatically remounted (up to MAX_RETRIES times)
 * rather than surfacing an error fallback to the user.
 */
export class ErrorBoundaryWithRecovery extends Component<Props, State> {
  state: State = { retryKey: 0 }

  componentDidCatch(error: Error) {
    if (
      isBrowserExtensionDOMError(error) &&
      this.state.retryKey < MAX_RETRIES
    ) {
      // Incrementing the key forces React to unmount and remount the children,
      // resetting the DOM to a clean state.
      this.setState((prev) => ({ retryKey: prev.retryKey + 1 }))
    }
  }

  render() {
    return (
      <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>
    )
  }
}
