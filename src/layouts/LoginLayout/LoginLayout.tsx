import { Suspense } from 'react'

import { LOCAL_STORAGE_SESSION_EXPIRED_KEY } from 'config'

import Footer from 'layouts/Footer'
import Header from 'layouts/Header'
import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'
import LoadingLogo from 'ui/LoadingLogo'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const LoginLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const showExpiryBanner = localStorage.getItem(
    LOCAL_STORAGE_SESSION_EXPIRED_KEY
  )
  return (
    <>
      {showExpiryBanner && <SessionExpiredBanner />}
<<<<<<< HEAD
      <Header />
=======
      <header className="bg-ds-primary-base text-white">
        <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
          <LogoButton />
        </nav>
      </header>
>>>>>>> feat: codecov 24.5.1-rc2 for apply athena service
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
