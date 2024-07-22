import cs from 'classnames'
import PropType from 'prop-types'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function SidebarLayout({ sidebar, children, className = '' }) {
  return (
    <div className="container flex flex-col lg:flex-row">
      <ErrorBoundary sentryScopes={[['layout', 'sidebar']]}>
        <NetworkErrorBoundary>
          {sidebar}
          <div
            data-testid="sidebar-content"
            className={cs('flex-1', className, { 'pl-0 lg:pl-8': !className })}
          >
            {children}
          </div>
        </NetworkErrorBoundary>
      </ErrorBoundary>
    </div>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropType.element.isRequired,
}

export default SidebarLayout
