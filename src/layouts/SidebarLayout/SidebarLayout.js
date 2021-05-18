import PropType from 'prop-types'
import cs from 'classnames'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function SidebarLayout({ sidebar, children, className }) {
  return (
    <div className="flex container flex-col lg:flex-row">
      <ErrorBoundary sentryScopes={[['layout', 'sidebar']]}>
        <NetworkErrorBoundary>
          {sidebar}
          <div
            data-testid="sidebar-content"
            className={cs('flex-1', className, { 'pl-0 lg:pl-4': !className })}
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
