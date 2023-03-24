import cs from 'classnames'
import { Suspense } from 'react'

import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import LogoSpinner from 'old_ui/LogoSpinner'
import { useImpersonate } from 'services/impersonate'
import { useUser } from 'services/user'
import A from 'ui/A'
import Avatar from 'ui/Avatar'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LogoSpinner />
  </div>
)

function LimitedLayout({ children }) {
  const { isImpersonating } = useImpersonate()
  const { data: currentUser, isLoading } = useUser()

  return (
    <Suspense fallback={<FullPageLoader />}>
      <header
        data-testid="header"
        className={cs('text-white', {
          'bg-ds-gray-octonary': !isImpersonating,
          'bg-ds-pink-tertiary': isImpersonating,
        })}
      >
        <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 py-4 px-3 sm:px-0">
          <div className="flex items-center gap-4">
            <A to={{ pageName: 'provider' }} variant="header">
              <span className="sr-only">Link to Homepage</span>
              <CodecovIcon />
            </A>
          </div>

          {!isLoading && (
            <div className="mx-2 flex items-center gap-4 md:mx-4">
              <Avatar user={currentUser?.user} bordered />
            </div>
          )}
        </nav>
      </header>
      <div className="container py-10 px-4 sm:px-0">
        <ErrorBoundary sentryScopes={[['layout', 'limited']]}>
          <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
        </ErrorBoundary>
      </div>
    </Suspense>
  )
}

export default LimitedLayout
