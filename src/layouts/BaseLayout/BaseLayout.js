import Footer from '../Footer'
import Header from '../Header'
import ToastNotifications from '../ToastNotifications'

function BaseLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ToastNotifications />
    </>
  )
}

export default BaseLayout
