import { lazy, Suspense } from 'react'
import { Redirect } from 'react-router-dom'

import Footer from 'layouts/Footer'
import Header from 'layouts/Header'
import ErrorBoundary from 'layouts/shared/ErrorBoundary'
import { EmptyErrorComponent } from 'layouts/shared/ErrorBoundary/ErrorBoundary'
import NetworkErrorBoundary from 'layouts/shared/NetworkErrorBoundary'
import ToastNotifications from 'layouts/ToastNotifications'
import { RepoBreadcrumbProvider } from 'pages/RepoPage/context'
import { useImpersonate } from 'services/impersonate'
import { useTracking } from 'services/tracking'
import GlobalBanners from 'shared/GlobalBanners'
import GlobalTopBanners from 'shared/GlobalTopBanners'
import LoadingLogo from 'ui/LoadingLogo'

import { useUserAccessGate } from './hooks/useUserAccessGate'

const DefaultOrgSelector = lazy(() => import('pages/DefaultOrgSelector'))
const InstallationHelpBanner = lazy(() => import('./InstallationHelpBanner'))
const TermsOfService = lazy(() => import('pages/TermsOfService'))

const FullPageLoader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

interface OnboardingOrChildrenProps extends React.PropsWithChildren {
  isImpersonating: boolean
  isFullExperience: boolean
  showAgreeToTerms: boolean
  redirectToSyncPage: boolean
  showDefaultOrgSelector: boolean
}

function OnboardingOrChildren({
  children,
  isImpersonating,
  isFullExperience,
  showAgreeToTerms,
  redirectToSyncPage,
  showDefaultOrgSelector,
}: OnboardingOrChildrenProps) {
  if (showAgreeToTerms && !isFullExperience) {
    return (
      <Suspense fallback={null}>
        <TermsOfService />
      </Suspense>
    )
  }

  if (redirectToSyncPage && !isFullExperience) {
    return <Redirect to="/sync" />
  }

  if (showDefaultOrgSelector && !isFullExperience && !isImpersonating) {
    return (
      <Suspense fallback={null}>
        <DefaultOrgSelector />
      </Suspense>
    )
  }

  return <>{children}</>
}

function BaseLayout({ children }: React.PropsWithChildren) {
  const {
    isFullExperience,
    showAgreeToTerms,
    showDefaultOrgSelector,
    redirectToSyncPage,
    isLoading,
  } = useUserAccessGate()
  useTracking()
  const { isImpersonating } = useImpersonate()

  // Pause rendering of a page till we know if the user is logged in or not
  if (isLoading) return <FullPageLoader />

  return (
    <>
      {/* Header */}
      <ErrorBoundary errorComponent={EmptyErrorComponent}>
        <RepoBreadcrumbProvider>
          <Suspense>
            {isFullExperience || isImpersonating ? (
              <>
                <GlobalTopBanners />
                <Header />
              </>
            ) : (
              <>{showDefaultOrgSelector ? <InstallationHelpBanner /> : null}</>
            )}
          </Suspense>
        </RepoBreadcrumbProvider>
      </ErrorBoundary>

      {/* Main Page Contents */}
      <Suspense fallback={<FullPageLoader />}>
        <RepoBreadcrumbProvider>
          <ErrorBoundary sentryScopes={[['layout', 'base']]}>
            <NetworkErrorBoundary>
              <main className="container mb-8 flex grow flex-col gap-2 md:p-0">
                <GlobalBanners />
                <OnboardingOrChildren
                  isFullExperience={isFullExperience}
                  showAgreeToTerms={showAgreeToTerms}
                  showDefaultOrgSelector={showDefaultOrgSelector}
                  redirectToSyncPage={redirectToSyncPage}
                  isImpersonating={isImpersonating}
                >
                  {children}
                </OnboardingOrChildren>
              </main>
            </NetworkErrorBoundary>
          </ErrorBoundary>
        </RepoBreadcrumbProvider>
      </Suspense>

      {/* Footer */}
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
