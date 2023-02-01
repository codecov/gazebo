import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import LogoSpinner from 'old_ui/LogoSpinner'
import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import TabNavigation from 'ui/TabNavigation'

import { RepoBreadcrumbProvider } from './context'
import DeactivatedRepo from './CoverageTab/DeactivatedRepo'
import { useMatchBlobsPath, useMatchTreePath } from './hooks'
import RepoBreadcrumb from './RepoBreadcrumb'

const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./NewRepoTab'))
const PullsTab = lazy(() => import('./PullsTab'))
const FlagsTab = lazy(() => import('./FlagsTab'))
const SettingsTab = lazy(() => import('./SettingsTab'))

const path = '/:provider/:owner/:repo'

const getRepoTabs = ({
  matchTree,
  matchBlobs,
  isCurrentUserPartOfOrg,
  provider,
  owner,
  repo,
}) => {
  let location = undefined
  if (matchTree) {
    location = { pathname: `/${provider}/${owner}/${repo}/tree` }
  } else if (matchBlobs) {
    location = { pathname: `/${provider}/${owner}/${repo}/blob` }
  }

  return [
    {
      pageName: 'overview',
      children: 'Coverage',
      exact: !matchTree && !matchBlobs,
      location,
    },
    { pageName: 'flagsTab' },
    { pageName: 'commits' },
    { pageName: 'pulls' },
    ...(isCurrentUserPartOfOrg ? [{ pageName: 'settings' }] : []),
  ]
}

const Loader = () => (
  <div className="flex-1 flex items-center justify-center mt-16">
    <LogoSpinner />
  </div>
)

// eslint-disable-next-line max-statements, complexity
function RepoPage() {
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()

  const isRepoActive = repoData?.repository?.active
  const isRepoActivated = repoData?.repository?.activated
  const isCurrentUserPartOfOrg = repoData?.isCurrentUserPartOfOrg
  const isRepoPrivate = !!repoData?.repository?.private

  console.log(isRepoActivated, isRepoActive)

  // if there is no repo data
  if (!repoData?.repository) {
    return <NotFound />
  }

  // if the repo is private and the user is not associated
  // then hard redirect to provider
  else if (isRepoPrivate && !isCurrentUserPartOfOrg) {
    return <NotFound />
  }

  return (
    <RepoBreadcrumbProvider>
      <div>
        <RepoBreadcrumb />
        {isRepoActive && isRepoActivated && (
          <div className="sticky top-8 z-10 bg-white mb-2">
            <TabNavigation
              tabs={getRepoTabs({
                matchTree,
                matchBlobs,
                isCurrentUserPartOfOrg,
                provider,
                owner,
                repo,
              })}
            />
          </div>
        )}
        <Suspense fallback={<Loader />}>
          {isRepoActivated ? (
            <Switch>
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
              <SentryRoute path={`${path}/flags`} exact>
                <FlagsTab />
              </SentryRoute>
              <SentryRoute path={`${path}/commits`} exact>
                <CommitsTab />
              </SentryRoute>
              <SentryRoute path={`${path}/pulls`} exact>
                <PullsTab />
              </SentryRoute>
              <Redirect from={`${path}/compare`} to={`${path}/pulls`} />
              <SentryRoute path={`${path}/settings`}>
                <SettingsTab />
              </SentryRoute>
              <Redirect
                from="/:provider/:owner/:repo/*"
                to="/:provider/:owner/:repo"
              />
            </Switch>
          ) : (
            <>
              {isRepoActive ? (
                <Switch>
                  <SentryRoute path={`${path}/settings`}>
                    <SettingsTab />
                  </SentryRoute>
                  <SentryRoute path={path}>
                    <DeactivatedRepo />
                  </SentryRoute>
                </Switch>
              ) : (
                <Switch>
                  <SentryRoute
                    path={[`${path}/new`, `${path}/new/other-ci`]}
                    exact
                  >
                    <NewRepoTab />
                  </SentryRoute>
                  <Redirect from={path} to={`${path}/new`} />
                  <Redirect from={`${path}/*`} to={`${path}/new`} />
                </Switch>
              )}
            </>
          )}
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
