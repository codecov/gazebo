import { lazy, Suspense, useState } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo, useRepoOverview } from 'services/repo'
import CustomError from 'shared/CustomError'
import { useFlags } from 'shared/featureFlags'
import A from 'ui/A'
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
}

function Routes({
  isRepoActivated,
  isRepoActive,
  coverageEnabled,
  bundleAnalysisEnabled,
  jsOrTsPresent,
}: RoutesProps) {
  const { bundleAnalysisPrAndCommitPages } = useFlags({
    bundleAnalysisPrAndCommitPages: false,
  })

  // repo is currently active and activated
  if (isRepoActive && isRepoActivated) {
    const productEnabled = coverageEnabled || bundleAnalysisEnabled
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
          <SentryRoute path={`${path}/bundles`} exact>
            <BundlesTab />
          </SentryRoute>
        ) : bundleAnalysisPrAndCommitPages ? (
          <SentryRoute
            path={[
              `${path}/bundles/new`,
              `${path}bundles/new/rollup`,
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
      <Redirect from={path} to={`${path}/new`} />
      <Redirect from={`${path}/bundles/*`} to={`${path}/bundles/new`} />
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

  if (!isCurrentUserActivated && isRepoPrivate) {
    throw new CustomError({
      status: 403,
      detail: (
        <p>
          Activation is required to view this repo, please{' '}
          <A
            to={{ pageName: 'membersTab' }}
            isExternal={false}
            hook="repo-page-to-members-tab"
          >
            click here{' '}
          </A>{' '}
          to activate your account.
        </p>
      ),
    })
  }

  return (
    <RepoBreadcrumbProvider>
      <div>
        <RepoBreadcrumb />
        <RepoPageTabs refetchEnabled={refetchEnabled} />
        <Suspense fallback={<Loader />}>
          <Routes
            isRepoActive={isRepoActive}
            isRepoActivated={isRepoActivated}
            coverageEnabled={coverageEnabled}
            bundleAnalysisEnabled={bundleAnalysisEnabled}
            jsOrTsPresent={jsOrTsPresent}
          />
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
