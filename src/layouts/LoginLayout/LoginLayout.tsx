import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'

import { LOCAL_STORAGE_SESSION_EXPIRED_KEY } from 'config'

import Footer from 'layouts/Footer'
import Header from 'layouts/Header'
import OldHeader from 'layouts/OldHeader'
import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'
import { useFlags } from 'shared/featureFlags'
import LoadingLogo from 'ui/LoadingLogo'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const LoginLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation()

  const { newHeader } = useFlags({
    newHeader: false,
  })

  const showExpiryBanner = localStorage.getItem(
    LOCAL_STORAGE_SESSION_EXPIRED_KEY
  )
  return (
    <>
      {(location.search.includes('expired') || showExpiryBanner) && (
        <SessionExpiredBanner />
      )}
      {newHeader ? <Header /> : <OldHeader />}
      <Suspense fallback={<FullPageLoader />}>
        <main className="container mb-8 mt-2 flex grow flex-col gap-2 md:p-0">
          {children}
        </main>
      </Suspense>
      <Footer />
    </>
  )
}

export default LoginLayout
