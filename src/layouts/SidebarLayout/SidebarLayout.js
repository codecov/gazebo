import PropType from 'prop-types'
import cs from 'classnames'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

function SidebarLayout({ sidebar, children }) {
  return (
    <div className="flex flex-col sm:flex-row p-4">
      <ErrorBoundary sentryScopes={[['layout', 'sidebar']]}>
        <NetworkErrorBoundary>
          {sidebar}
          <article
            className={cs(
              'flex-1', // parent
              'grid grid-flow-col auto-cols-max md:auto-cols-min gap-0 sm:gap-4', // contents
              'p-0 sm:p-4 px-4 sm:px-0'
            )}
          >
            {children}
          </article>
        </NetworkErrorBoundary>
      </ErrorBoundary>
    </div>
  )
}

SidebarLayout.propTypes = {
  sidebar: PropType.element.isRequired,
}

export default SidebarLayout
