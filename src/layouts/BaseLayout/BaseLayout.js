import { Suspense } from 'react'

import LogoSpinner from 'ui/LogoSpinner'
import { useTracking } from 'services/tracking'

import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
import Footer from '../Footer'
import Header from '../Header'
import ToastNotifications from '../ToastNotifications'

function BaseLayout({ children }) {
  useTracking()

  const fullPageLoader = (
    <div className="h-screen w-screen flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <Suspense fallback={fullPageLoader}>
        <main className="flex-grow bg-gray-200 mt-20 md:mt-28 md:mb-10">
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
