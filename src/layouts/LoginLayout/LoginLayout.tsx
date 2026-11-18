import { useLocation } from 'react-router-dom'

import Footer from 'layouts/Footer'
import GuestHeader from 'layouts/Header/components/GuestHeader'
import SessionExpiredBanner from 'pages/LoginPage/SessionExpiredBanner'

const LoginLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation()

  return (
    <>
      {location.search.includes('expired') && <SessionExpiredBanner />}
      <GuestHeader />
      <main className="container mb-8 mt-2 flex grow flex-col gap-2 bg-ds-background md:p-0">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default LoginLayout
