import { Suspense } from 'react'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useTracking } from 'services/tracking'
// import { useSegmentUser } from 'services/tracking/segment'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
import Footer from '../Footer'
import Header from '../Header'
import ToastNotifications from '../ToastNotifications'

function BaseLayout({ children }) {
  useTracking()
  // useSegmentUser()

  const fullPageLoader = (
    <div className="h-screen w-screen flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <Suspense fallback={fullPageLoader}>
        <main className="container flex-grow mt-6 mb-10 md:p-0">
          <ErrorBoundary sentryScopes={[['layout', 'base']]}>
            <NetworkErrorBoundary>{children}</NetworkErrorBoundary>
          </ErrorBoundary>
        </main>
      </Suspense>
      <Footer />
      <ToastNotifications />
    </>
  )
}

export default BaseLayout
