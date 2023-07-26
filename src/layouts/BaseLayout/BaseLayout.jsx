import { lazy, Suspense, useEffect } from 'react'
import { Redirect, useHistory, useLocation } from 'react-router-dom'

import Footer from 'layouts/Footer'
import Header from 'layouts/Header'
import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import ToastNotifications from 'layouts/ToastNotifications'
import { useLocationParams } from 'services/navigation'
import { useTracking } from 'services/tracking'
import { useUser } from 'services/user'
import GlobalBanners from 'shared/GlobalBanners'
import GlobalTopBanners from 'shared/GlobalTopBanners'
import LoadingLogo from 'ui/LoadingLogo'

import { useUserAccessGate } from './hooks/useUserAccessGate'

const SetUpActions = Object.freeze({
  INSTALL: 'install',
  REQUEST: 'request',
})

const DefaultOrgSelector = lazy(() => import('pages/DefaultOrgSelector'))
const LimitedHeader = lazy(() => import('layouts/LimitedHeader'))
const InstallationHelpBanner = lazy(() =>
  import('pages/DefaultOrgSelector/InstallationHelpBanner')
)

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

const OnboardingOrChildren = ({ children }) => {
  const { data: currentUser, isLoading } = useUser()

  const history = useHistory()
  const location = useLocation()

  const { params } = useLocationParams()
  const { setup_action: setupAction } = params
  const defaultOrg = currentUser?.user?.username

  useEffect(() => {
    if (setupAction === SetUpActions.REQUEST) {
      const queryParams = new URLSearchParams(location.search)

      queryParams.set('setup_action', 'request')
      return history.push(`/gh/${defaultOrg}?${queryParams.toString()}`)
    }
  }, [defaultOrg, history, location.search, setupAction])

  if (!currentUser && !isLoading) return <Redirect to="/login" />
  if (defaultOrg) return children

  return (
    <Suspense fallback={null}>
      <InstallationHelpBanner />
      <DefaultOrgSelector />
    </Suspense>
  )
}

function BaseLayout({ children }) {
  const { isFullExperience, isLoading } = useUserAccessGate()

  useTracking()

  // Pause rendering of a page till we know if the user is logged in or not
  if (isLoading) return <FullPageLoader />

  return (
    <>
      {isFullExperience ? (
        <>
          <Header />
          <GlobalTopBanners />
        </>
      ) : (
        <Suspense fallback={null}>
          <LimitedHeader />
        </Suspense>
      )}
      <Suspense fallback={<FullPageLoader />}>
        <ErrorBoundary sentryScopes={[['layout', 'base']]}>
          <NetworkErrorBoundary>
            <main className="container mb-8 mt-2 flex grow flex-col gap-2 md:p-0">
              <GlobalBanners />
              <OnboardingOrChildren>{children}</OnboardingOrChildren>
            </main>
          </NetworkErrorBoundary>
        </ErrorBoundary>
      </Suspense>
      {isFullExperience && (
        <>
          <Footer />
          <ToastNotifications />
        </>
      )}
    </>
  )
}

export default BaseLayout
