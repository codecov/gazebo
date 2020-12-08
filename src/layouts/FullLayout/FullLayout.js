import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
import BaseLayout from '../BaseLayout'

function FullLayout({ children }) {
  return (
    <BaseLayout>
      <main className="flex-grow bg-gray-200 mt-16">
        <article
          className="container py-10 px-4 sm:px-0"
          data-testid="full-layout"
        >
          <ErrorBoundary sentryScopes={[['layout', 'full']]}>
            <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
          </ErrorBoundary>
        </article>
      </main>
    </BaseLayout>
  )
}

export default FullLayout
