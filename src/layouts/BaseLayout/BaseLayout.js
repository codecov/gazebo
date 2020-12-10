import { Suspense } from 'react'

import LogoSpinner from 'ui/LogoSpinner'

import Footer from '../Footer'
import Header from '../Header'
import ToastNotifications from '../ToastNotifications'

function BaseLayout({ children }) {
  const fullPageLoader = (
    <div className="h-screen w-screen flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <>
      <Header />
      <Suspense fallback={fullPageLoader}>
        <main className="flex-grow bg-gray-200 mt-20">{children}</main>
      </Suspense>
      <Footer />
      <ToastNotifications />
    </>
  )
}

export default BaseLayout
