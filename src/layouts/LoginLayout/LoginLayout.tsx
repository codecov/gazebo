import { Suspense } from 'react'

import { ReactComponent as CodecovIcon } from 'assets/svg/codecov.svg'
import Footer from 'layouts/Footer'
import A from 'ui/A'
import LoadingLogo from 'ui/LoadingLogo'

const LogoButton = () => {
  return (
    // @ts-expect-error
    <A
      to={{
        pageName: 'root',
      }}
      variant="header"
      data-testid="homepage-link"
    >
      <span className="sr-only">Link to Homepage</span>
      <CodecovIcon />
    </A>
  )
}

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const LoginLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <header className="bg-ds-primary-base text-white">
        <nav className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-0">
          <LogoButton />
          <div className="text-ds-gray-tertiary">
            New to Codecov? {/* @ts-expect-error */}
            <A to={{ pageName: 'root' }} variant="header">
              Learn more
            </A>
          </div>
        </nav>
      </header>
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
