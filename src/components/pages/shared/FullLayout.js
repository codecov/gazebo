import ErrorBoundary from 'components/ErrorBoundary'

function FullLayout({ children }) {
  return (
    <div className="flex-grow bg-gray-200">
      <article
        className="container py-10 px-4 sm:px-0"
        data-testid="full-layout"
      >
        <ErrorBoundary
          beforeCapture={(scope) => {
            scope.setTag('layout', 'full')
          }}
          errorComponent={<p>Opps. Looks like we hit a snag.</p>}
        >
          {children}
        </ErrorBoundary>
      </article>
    </div>
  )
}

export default FullLayout
