import { useQuery as useQueryV5 } from '@tanstack/react-queryV5'
import { lazy, Suspense } from 'react'
import { Redirect, useParams } from 'react-router-dom'

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

import { NavigatorDataQueryOpts } from './hooks/NavigatorDataQueryOpts'
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

interface URLParams {
  provider?: string
  owner?: string
  repo?: string
}

function BaseLayout({ children }: React.PropsWithChildren) {
  const { provider, owner, repo } = useParams<URLParams>()
  useTracking()
  const { isImpersonating } = useImpersonate()
  const {
    isFullExperience,
    showAgreeToTerms,
    showDefaultOrgSelector,
    redirectToSyncPage,
    isLoading: isUserAccessGateLoading,
  } = useUserAccessGate()

  // we have to fetch the data for the navigator up here as we can't
  // conditionally call a suspense query, as well we need a way to have the
  // loader be shown while we're loading
  const { data, isLoading: isNavigatorDataLoading } = useQueryV5({
    enabled: !!provider && !!owner && !!repo,
    ...NavigatorDataQueryOpts({
      // if these aren't provided, the query is disabled so we don't need to
      // worry about the empty strings causing errors
      provider: provider ?? '',
      owner: owner ?? '',
      repo: repo ?? '',
    }),
  })

  // Pause rendering of a page till we know if the user is logged in or not
  if (isUserAccessGateLoading || isNavigatorDataLoading) {
    return <FullPageLoader />
  }

  return (
    <>
      <RepoBreadcrumbProvider>
        {/* Header */}
        <Suspense>
          <ErrorBoundary errorComponent={<EmptyErrorComponent />}>
            <NetworkErrorBoundary>
              {isFullExperience || isImpersonating ? (
                <>
                  <GlobalTopBanners />
                  <Header hasRepoAccess={data?.hasRepoAccess} />
                </>
              ) : (
                <>
                  {showDefaultOrgSelector ? <InstallationHelpBanner /> : null}
                </>
              )}
            </NetworkErrorBoundary>
          </ErrorBoundary>
        </Suspense>

        {/* Main Page Contents */}
        <Suspense fallback={<FullPageLoader />}>
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
        </Suspense>

        {/* Footer */}
        {isFullExperience && (
          <>
            <Footer />
            <ToastNotifications />
          </>
        )}
      </RepoBreadcrumbProvider>
    </>
  )
}

export default BaseLayout
