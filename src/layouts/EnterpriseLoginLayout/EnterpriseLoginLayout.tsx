import { Suspense } from 'react'

import Footer from 'layouts/Footer'
import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import ToastNotifications from 'layouts/ToastNotifications'
import GlobalBanners from 'shared/GlobalBanners'
import LoadingLogo from 'ui/LoadingLogo'
import SessionExpiryTracker from 'ui/SessionExpiryTracker'

import Header from './Header'

const LOCAL_STORAGE_SESSION_TRACKING_KEY = 'tracking-session-expiry'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function EnterpriseLoginLayout({ children }: { children: React.ReactNode }) {
  const isTrackingSession = localStorage.getItem(
    LOCAL_STORAGE_SESSION_TRACKING_KEY
  )
  return (
    <>
      <Header />
      {!isTrackingSession && <SessionExpiryTracker />}
      <Suspense fallback={<FullPageLoader />}>
        <ErrorBoundary sentryScopes={[['layout', 'base']]}>
          <NetworkErrorBoundary>
            <main className="container mb-8 mt-2 flex grow flex-col gap-2 md:p-0">
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

export default EnterpriseLoginLayout
