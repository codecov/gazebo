import ErrorBoundary from 'components/ErrorBoundary'
import NetworkErrorBoundary from 'components/NetworkErrorBoundary'

function FullLayout({ children }) {
  return (
    <div className="flex-grow bg-gray-200">
      <article
        className="container py-10 px-4 sm:px-0"
        data-testid="full-layout"
      >
        <ErrorBoundary sentryScopes={[['layout', 'full']]}>
          <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
        </ErrorBoundary>
      </article>
    </div>
  )
}

export default FullLayout
