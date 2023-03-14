import { Suspense } from 'react'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useTracking } from 'services/tracking'
import GlobalBanners from 'shared/GlobalBanners'

import Footer from '../Footer'
import Header from '../Header'
import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
import ToastNotifications from '../ToastNotifications'

function BaseLayout({ children }) {
  useTracking()

  const fullPageLoader = (
    <div className="mt-16 flex flex-1 items-center justify-center">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <Suspense fallback={fullPageLoader}>
        <ErrorBoundary sentryScopes={[['layout', 'base']]}>
          <NetworkErrorBoundary>
            <main className="container mt-2 mb-8 flex grow flex-col gap-2 md:p-0">
              <GlobalBanners />
              {children}
            </main>
          </NetworkErrorBoundary>
        </ErrorBoundary>
      </Suspense>
      <Footer />
      <ToastNotifications />
    </>
  )
}

export default BaseLayout
