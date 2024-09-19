import cs from 'classnames'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  className?: string
}

const SidebarLayout: React.FC<React.PropsWithChildren<SidebarLayoutProps>> = ({
  sidebar,
  children,
  className = '',
}) => {
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

export default SidebarLayout
