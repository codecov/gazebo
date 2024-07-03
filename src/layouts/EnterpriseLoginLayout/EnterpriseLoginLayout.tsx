import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'

import { LOCAL_STORAGE_SESSION_EXPIRED_KEY } from 'config'

import Footer from 'layouts/Footer'
import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import ToastNotifications from 'layouts/ToastNotifications'
import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'
import GlobalBanners from 'shared/GlobalBanners'
import LoadingLogo from 'ui/LoadingLogo'

import Header from './Header'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function EnterpriseLoginLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  const showExpiryBanner = localStorage.getItem(
    LOCAL_STORAGE_SESSION_EXPIRED_KEY
  )
  return (
    <>
      <Header />
      {(location.search.includes('expired') || showExpiryBanner) && (
        <SessionExpiredBanner />
      )}
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
