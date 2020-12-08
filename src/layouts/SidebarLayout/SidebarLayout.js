import PropType from 'prop-types'

import BaseLayout from '../BaseLayout'
import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function SidebarLayout({ sidebar, children }) {
  return (
    <BaseLayout>
      <main className="flex-grow grid grid-cols-1 sm:grid-cols-7 p-4 bg-gray-200 mt-16">
        {sidebar}
        <article className="col-span-6 grid sm:grid-cols-12 grid-cols-1 sm:gap-4 gap-0 p-0 sm:p-4 px-4 sm:px-0">
          <ErrorBoundary sentryScopes={[['layout', 'sidebar']]}>
            <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
          </ErrorBoundary>
        </article>
      </main>
    </BaseLayout>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropType.element.isRequired,
}

export default SidebarLayout
