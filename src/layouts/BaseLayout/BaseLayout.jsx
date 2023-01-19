import { Suspense } from 'react'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useTracking } from 'services/tracking'
import GlobalBanners from 'shared/GlobalBanners'

import Footer from '../Footer'
import Header from '../Header'
import ErrorBoundary from '../shared/ErrorBoundary'
import NetworkErrorBoundary from '../shared/NetworkErrorBoundary'
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
        <ErrorBoundary sentryScopes={[['layout', 'base']]}>
          <NetworkErrorBoundary>
            <main className="container grow flex flex-col gap-4 mt-2 mb-8 md:p-0">
              <GlobalBanners />
              {children}
              <UserOnboarding />
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
