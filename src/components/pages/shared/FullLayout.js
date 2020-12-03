import ErrorBoundary from 'components/ErrorBoundary'

function FullLayout({ children }) {
  return (
    <main className="flex-grow bg-gray-200 mt-16">
      <article
        className="container py-10 px-4 sm:px-0"
        data-testid="full-layout"
      >
        <ErrorBoundary sentryScopes={[['layout', 'full']]}>
          {children}
        </ErrorBoundary>
      </article>
    </main>
  )
}

export default FullLayout
