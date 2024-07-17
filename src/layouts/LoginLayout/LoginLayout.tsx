import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'

import Footer from 'layouts/Footer'
import GuestHeader from 'layouts/Header/components/GuestHeader'
import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'
import LoadingLogo from 'ui/LoadingLogo'

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const LoginLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation()

  return (
    <>
      {location.search.includes('expired') && <SessionExpiredBanner />}
      <GuestHeader />
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
