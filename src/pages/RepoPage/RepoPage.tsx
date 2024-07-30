import { lazy, Suspense, useLayoutEffect, useState } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo, useRepoOverview } from 'services/repo'
import { useFlags } from 'shared/featureFlags'
import Icon from 'ui/Icon'
import LoadingLogo from 'ui/LoadingLogo'

import ActivationAlert from './ActivationAlert'
import { useCrumbs } from './context'
import DeactivatedRepo from './DeactivatedRepo'
import RepoPageTabs from './RepoPageTabs'

const BundlesTab = lazy(() => import('./BundlesTab'))
const BundleOnboarding = lazy(() => import('./BundlesTab/BundleOnboarding'))
const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./CoverageOnboarding'))
const PullsTab = lazy(() => import('./PullsTab'))
const SettingsTab = lazy(() => import('./SettingsTab'))
const FailedTestsTab = lazy(() => import('./FailedTestsTab'))

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
  const { onboardingFailedTests } = useFlags({
    bundleAnalysisPrAndCommitPages: false,
    onboardingFailedTests: false,
  })

  const productEnabled = coverageEnabled || bundleAnalysisEnabled
  const userAuthorizedtoViewRepo =
    (isRepoPrivate && isCurrentUserActivated) || !isRepoPrivate
  const showUnauthorizedMessageCoverage =
    coverageEnabled && isRepoPrivate && !isCurrentUserActivated
  const showUnauthorizedMessageBundles =
    bundleAnalysisEnabled && isRepoPrivate && !isCurrentUserActivated

  if (isRepoActive && isRepoActivated) {
    return (
      <Switch>
        {coverageEnabled ? (
          <SentryRoute
            path={[
              path,
              `${path}/flags`,
              `${path}/components`,
              `${path}/blob/:ref/:path+`,
              `${path}/tree/:branch`,
              `${path}/tree/:branch/:path+`,
            ]}
            exact
          >
            {showUnauthorizedMessageCoverage ? (
              <ActivationAlert />
            ) : (
              <CoverageTab />
            )}
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
        {bundleAnalysisEnabled ? (
          <SentryRoute
            path={[
              `${path}/bundles/:branch/:bundle`,
              `${path}/bundles/:branch`,
              `${path}/bundles`,
            ]}
            exact
          >
            {showUnauthorizedMessageBundles ? (
              <ActivationAlert />
            ) : (
              <BundlesTab />
            )}
          </SentryRoute>
        ) : jsOrTsPresent ? (
          <SentryRoute
            path={[
              `${path}/bundles/new`,
              `${path}/bundles/new/rollup`,
              `${path}/bundles/new/webpack`,
            ]}
            exact
          >
            <BundleOnboarding />
          </SentryRoute>
        ) : null}
        {onboardingFailedTests ? (
          <SentryRoute
            path={[
              `${path}/tests`,
              `${path}/tests/new`,
              `${path}/tests/new/codecov-cli`,
              `${path}/tests/:branch`,
            ]}
            exact
          >
            <FailedTestsTab />
          </SentryRoute>
        ) : null}
        {productEnabled && userAuthorizedtoViewRepo ? (
          <SentryRoute path={`${path}/commits`} exact>
            <CommitsTab />
          </SentryRoute>
        ) : null}
        {productEnabled && userAuthorizedtoViewRepo ? (
          <SentryRoute path={`${path}/pulls`} exact>
            <PullsTab />
          </SentryRoute>
        ) : null}
        {productEnabled && userAuthorizedtoViewRepo ? (
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
        {onboardingFailedTests ? (
          <Redirect from={`${path}/tests/new/*`} to={`${path}/tests/new`} />
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
      {onboardingFailedTests ? (
        <SentryRoute
          path={[
            `${path}/tests`,
            `${path}/tests/new`,
            `${path}/tests/new/codecov-cli`,
            `${path}/tests/:branch`,
          ]}
          exact
        >
          <FailedTestsTab />
        </SentryRoute>
      ) : null}
      {jsOrTsPresent ? (
        <SentryRoute
          path={[
            `${path}/bundles/new`,
            `${path}/bundles/new/rollup`,
            `${path}/bundles/new/webpack`,
          ]}
          exact
        >
          <BundleOnboarding />
        </SentryRoute>
      ) : null}
      <SentryRoute path={`${path}/settings`}>
        <SettingsTab />
      </SentryRoute>
      <Redirect from={`${path}/bundles`} to={`${path}/bundles/new`} />
      <Redirect from={`${path}/bundles/*`} to={`${path}/bundles/new`} />
      <Redirect from={`${path}/tests/new/*`} to={`${path}/tests/new`} />
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
  const { setBaseCrumbs } = useCrumbs()

  useLayoutEffect(() => {
    setBaseCrumbs([
      { pageName: 'owner', text: owner },
      {
        pageName: 'repo',
        children: (
          <div
            className="inline-flex items-center gap-1"
            data-testid="breadcrumb-repo"
          >
            {repoData?.repository?.private && (
              <Icon name="lockClosed" variant="solid" size="sm" />
            )}
            {repo}
          </div>
        ),
      },
    ])
  }, [owner, repo, repoData, setBaseCrumbs])

  const coverageEnabled =
    repoOverview?.coverageEnabled ?? repoData?.isCoverageEnabled
  const bundleAnalysisEnabled =
    repoOverview?.bundleAnalysisEnabled ?? repoData?.isBundleAnalysisEnabled
  const jsOrTsPresent = repoOverview?.jsOrTsPresent
  const isCurrentUserActivated = repoData?.isCurrentUserActivated
  const isRepoActive = repoData?.repository?.active
  const isRepoActivated = repoData?.repository?.activated
  const isRepoPrivate =
    !!repoData?.repository?.private ?? repoData?.isRepoPrivate
  if (!refetchEnabled && !isRepoActivated) {
    setRefetchEnabled(true)
  }
  if (!repoData) return <NotFound />

  return (
    <div>
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
  )
}

export default RepoPage
