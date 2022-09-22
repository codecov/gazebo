import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function FullLayout({ children }) {
  return (
    <div className="container py-10 px-4 sm:px-0" data-testid="full-layout">
      <ErrorBoundary sentryScopes={[['layout', 'full']]}>
        <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
      </ErrorBoundary>
    </div>
  )
}

export default FullLayout
