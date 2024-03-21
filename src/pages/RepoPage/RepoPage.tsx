import { lazy, Suspense, useState } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import img403 from 'layouts/shared/NetworkErrorBoundary/assets/error-403.svg'
import { NetworkErrorMessage } from 'layouts/shared/NetworkErrorBoundary/NetworkErrorBoundary'
import NotFound from 'pages/NotFound'
import { useRepo, useRepoOverview } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
import Button from 'ui/Button'
import LoadingLogo from 'ui/LoadingLogo'

import { RepoBreadcrumbProvider } from './context'
import DeactivatedRepo from './DeactivatedRepo'
import RepoBreadcrumb from './RepoBreadcrumb'
import RepoPageTabs from './RepoPageTabs'


const BundlesTab = lazy(() => import('./BundlesTab'))
const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./CoverageOnboarding'))
const PullsTab = lazy(() => import('./PullsTab'))
const FlagsTab = lazy(() => import('./FlagsTab'))
const SettingsTab = lazy(() => import('./SettingsTab'))

const path = '/:provider/:owner/:repo'

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface RoutesProps {
  isRepoActivated: boolean
  isRepoActive: boolean
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
  jsOrTsPresent?: boolean
  isRepoPrivate: boolean
  isCurrentUserActivated?: boolean | null
}

function Routes({
  isRepoActivated,
  isRepoActive,
  coverageEnabled,
  bundleAnalysisEnabled,
  jsOrTsPresent,
  isRepoPrivate,
  isCurrentUserActivated,
}: RoutesProps) {
  const { bundleAnalysisPrAndCommitPages } = useFlags({
    bundleAnalysisPrAndCommitPages: false,
  })

  const productEnabled = coverageEnabled || bundleAnalysisEnabled
  if (productEnabled && !isCurrentUserActivated && isRepoPrivate) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <img src={img403} alt="Forbidden" className="w-1/6" />
        <h1 className="mt-6 text-2xl">Unauthorized</h1>
        <p className="mt-6">
          Activation is required to view this repo
          <A
            to={{ pageName: 'membersTab' }}
            isExternal={false}
            hook="repo-page-to-members-tab"
            className="my-4"
          >
            Click here to activate your account.
          </A>
        </p>
        <NetworkErrorMessage />
        <p className="mb-4 font-bold">Error 403</p>
        <Button
          to={{ pageName: 'owner' }}
          disabled={undefined}
          hook={undefined}
        >
          Return to previous page
        </Button>
      </div>
    )
  }

  if (isRepoActive && isRepoActivated) {
    return (
      <Switch>
        {coverageEnabled ? (
          <SentryRoute
            path={[
              path,
              `${path}/blob/:ref/:path+`,
              `${path}/tree/:branch`,
              `${path}/tree/:branch/:path+`,
            ]}
            exact
          >
            <CoverageTab />
          </SentryRoute>
        ) : (
          <SentryRoute
            path={[
              `${path}/new`,
              `${path}/new/circle-ci`,
              `${path}/new/other-ci`,
            ]}
            exact
          >
            <NewRepoTab />
          </SentryRoute>
        )}
        {bundleAnalysisEnabled && bundleAnalysisPrAndCommitPages ? (
          <SentryRoute
            path={[
              `${path}/bundles/:branch/:bundle`,
              `${path}/bundles/:branch`,
              `${path}/bundles`,
            ]}
            exact
          >
            <BundlesTab />
          </SentryRoute>
        ) : jsOrTsPresent && bundleAnalysisPrAndCommitPages ? (
          <SentryRoute
            path={[
              `${path}/bundles/new`,
              `${path}/bundles/new/rollup`,
              `${path}/bundles/new/webpack`,
            ]}
            exact
          >
            <BundlesTab />
          </SentryRoute>
        ) : null}
        {coverageEnabled ? (
          <SentryRoute path={`${path}/flags`} exact>
            <FlagsTab />
          </SentryRoute>
        ) : null}
        {productEnabled ? (
          <SentryRoute path={`${path}/commits`} exact>
            <CommitsTab />
          </SentryRoute>
        ) : null}
        {productEnabled ? (
          <SentryRoute path={`${path}/pulls`} exact>
            <PullsTab />
          </SentryRoute>
        ) : null}
        {productEnabled ? (
          <Redirect from={`${path}/compare`} to={`${path}/pulls`} />
        ) : null}
        <SentryRoute path={`${path}/settings`}>
          <SettingsTab />
        </SentryRoute>
        {/* need to do these individual returns as the redirects won't work with a react fragment */}
        {!bundleAnalysisEnabled && jsOrTsPresent ? (
          <Redirect from={`${path}/bundles`} to={`${path}/bundles/new`} />
        ) : null}
        {!bundleAnalysisEnabled && jsOrTsPresent ? (
          <Redirect from={`${path}/bundles/*`} to={`${path}/bundles/new`} />
        ) : null}
        {!coverageEnabled ? <Redirect from={path} to={`${path}/new`} /> : null}
        {!coverageEnabled ? (
          <Redirect from={`${path}/*`} to={`${path}/new`} />
        ) : null}
        <Redirect
          from="/:provider/:owner/:repo/*"
          to="/:provider/:owner/:repo"
        />
      </Switch>
    )
  }

  // repo is currently deactivated
  if (isRepoActive) {
    return (
      <Switch>
        <SentryRoute path={`${path}/settings`}>
          <SettingsTab />
        </SentryRoute>
        <SentryRoute path={[path, `${path}/bundles`]}>
          <DeactivatedRepo />
        </SentryRoute>
      </Switch>
    )
  }

  return (
    <Switch>
      <SentryRoute
        path={[`${path}/new`, `${path}/new/circle-ci`, `${path}/new/other-ci`]}
        exact
      >
        <NewRepoTab />
      </SentryRoute>
      {jsOrTsPresent && bundleAnalysisPrAndCommitPages ? (
        <SentryRoute
          path={[
            `${path}/bundles/new`,
            `${path}/bundles/new/rollup`,
            `${path}/bundles/new/webpack`,
          ]}
          exact
        >
          <BundlesTab />
        </SentryRoute>
      ) : null}
      <SentryRoute path={`${path}/settings`}>
        <SettingsTab />
      </SentryRoute>
      <Redirect from={`${path}/bundles`} to={`${path}/bundles/new`} />
      <Redirect from={`${path}/bundles/*`} to={`${path}/bundles/new`} />
      <Redirect from={path} to={`${path}/new`} />
      <Redirect from={`${path}/*`} to={`${path}/new`} />
    </Switch>
  )
}

function RepoPage() {
  const { provider, owner, repo } = useParams<URLParams>()
  const [refetchEnabled, setRefetchEnabled] = useState(false)
  const { data: repoOverview } = useRepoOverview({ provider, owner, repo })
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
    opts: {
      refetchOnWindowFocus: refetchEnabled,
    },
  })

  const coverageEnabled = repoOverview?.coverageEnabled
  const bundleAnalysisEnabled = repoOverview?.bundleAnalysisEnabled
  const jsOrTsPresent = repoOverview?.jsOrTsPresent
  const isCurrentUserActivated = repoData?.isCurrentUserActivated
  const isRepoActive = repoData?.repository?.active
  const isRepoActivated = repoData?.repository?.activated
  const isRepoPrivate = !!repoData?.repository?.private
  if (!refetchEnabled && !isRepoActivated) {
    setRefetchEnabled(true)
  }

  if (!repoData?.repository) return <NotFound />

  return (
    <RepoBreadcrumbProvider>
      <div>
        <RepoBreadcrumb />
        <RepoPageTabs refetchEnabled={refetchEnabled} />
        <Suspense fallback={<Loader />}>
          <Routes
            isRepoActive={isRepoActive || false}
            isRepoActivated={isRepoActivated || false}
            coverageEnabled={coverageEnabled}
            bundleAnalysisEnabled={bundleAnalysisEnabled}
            jsOrTsPresent={jsOrTsPresent}
            isRepoPrivate={isRepoPrivate}
            isCurrentUserActivated={isCurrentUserActivated}
          />
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
