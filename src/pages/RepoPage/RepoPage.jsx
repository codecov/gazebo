import { lazy, Suspense, useState } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import CustomError from 'shared/CustomError'
import A from 'ui/A'
import LoadingLogo from 'ui/LoadingLogo'
import TabNavigation from 'ui/TabNavigation'

import { RepoBreadcrumbProvider } from './context'
import DeactivatedRepo from './DeactivatedRepo'
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
  tierData,
  isRepoPrivate,
}) => {
  let location = undefined
  if (matchTree) {
    location = { pathname: `/${provider}/${owner}/${repo}/tree` }
  } else if (matchBlobs) {
    location = { pathname: `/${provider}/${owner}/${repo}/blob` }
  }
  const hideFlagsTab = isRepoPrivate && tierData === TierNames.TEAM

  return [
    {
      pageName: 'overview',
      children: 'Coverage',
      exact: !matchTree && !matchBlobs,
      location,
    },
    ...(hideFlagsTab ? [] : [{ pageName: 'flagsTab' }]),
    { pageName: 'commits' },
    { pageName: 'pulls' },
    ...(isCurrentUserPartOfOrg ? [{ pageName: 'settings' }] : []),
  ]
}

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <LoadingLogo />
  </div>
)

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const [refetchEnabled, setRefetchEnabled] = useState(false)
  const { data: tierData } = useTier({ owner, provider })

  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
    opts: {
      refetchOnWindowFocus: refetchEnabled,
    },
  })

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()
  const isCurrentUserPartOfOrg = repoData?.isCurrentUserPartOfOrg
  const isCurrentUserActivated = repoData?.isCurrentUserActivated
  const isRepoActive = repoData?.repository?.active
  const isRepoActivated = repoData?.repository?.activated
  const isRepoPrivate = !!repoData?.repository?.private

  if (!refetchEnabled && !isRepoActivated) {
    setRefetchEnabled(true)
  }

  if (!repoData?.repository) return <NotFound />

  if (!isCurrentUserActivated && isRepoPrivate)
    throw new CustomError({
      status: 403,
      detail: (
        <p>
          Activation is required to view this repo, please{' '}
          <A to={{ pageName: 'membersTab' }}>click here </A> to activate your
          account.
        </p>
      ),
    })

  console.log(isRepoActive)

  return (
    <RepoBreadcrumbProvider>
      <div>
        <RepoBreadcrumb />
        {isRepoActive && isRepoActivated && (
          <div className="sticky top-8 z-10 mb-2 bg-white">
            <TabNavigation
              tabs={getRepoTabs({
                matchTree,
                matchBlobs,
                isCurrentUserPartOfOrg,
                provider,
                owner,
                repo,
                tierData,
                isRepoPrivate,
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
                    path={[
                      `${path}/new`,
                      `${path}/new/circle-ci`,
                      `${path}/new/other-ci`,
                    ]}
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
