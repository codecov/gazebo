import PropType from 'prop-types'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function SidebarLayout({ sidebar, children }) {
  return (
    <div className="flex flex-col sm:flex-row p-4">
      <ErrorBoundary sentryScopes={[['layout', 'sidebar']]}>
        <NetworkErrorBoundary>
          {sidebar}
          <div className="flex-1 pl-0 sm:pl-4">{children}</div>
        </NetworkErrorBoundary>
      </ErrorBoundary>
    </div>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropType.element.isRequired,
}

export default SidebarLayout
