import { Suspense } from 'react'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useTracking } from 'services/tracking'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
import Footer from '../Footer'
import Header from '../Header'
import ToastNotifications from '../ToastNotifications'
import UserOnboarding from '../UserOnboarding'

function BaseLayout({ children }) {
  useTracking()

  const fullPageLoader = (
    <div className="flex-1 flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <Suspense fallback={fullPageLoader}>
        <main className="container flex-grow mt-4 mb-8 md:p-0">
          <ErrorBoundary sentryScopes={[['layout', 'base']]}>
            <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
          </ErrorBoundary>
        </main>
      </Suspense>
      <Footer />
      <UserOnboarding />
      <ToastNotifications />
    </>
  )
}

export default BaseLayout
