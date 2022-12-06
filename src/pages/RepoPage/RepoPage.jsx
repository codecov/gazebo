import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import LogoSpinner from 'old_ui/LogoSpinner'
import NotFound from 'pages/NotFound'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'
import { useOwner } from 'services/user'
import TabNavigation from 'ui/TabNavigation'

import { RepoBreadcrumbProvider } from './context'
import DeactivatedRepo from './CoverageTab/DeactivatedRepo'
import { useMatchBlobsPath, useMatchTreePath } from './hooks'
import RepoBreadcrumb from './RepoBreadcrumb'
import SettingsTab from './SettingsTab'

import { useFlags } from '../../shared/featureFlags'

const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./NewRepoTab'))
const PullsTab = lazy(() => import('./PullsTab'))
const FlagsTab = lazy(() => import('./FlagsTab'))

const path = '/:provider/:owner/:repo'

const shouldShowFlagsTab = ({ gazeboFlagsTab, isRepoActivated }) =>
  gazeboFlagsTab && isRepoActivated

const getRepoTabs = ({
  matchTree,
  matchBlobs,
  isRepoActivated,
  isCurrentUserPartOfOrg,
  gazeboFlagsTab,
}) => [
  {
    pageName: 'overview',
    children: 'Coverage',
    exact: `${!matchTree && !matchBlobs}`,
  },
  ...(shouldShowFlagsTab({ gazeboFlagsTab, isRepoActivated })
    ? [{ pageName: 'flagsTab' }]
    : []),
  { pageName: 'commits' },
  { pageName: 'pulls' },
  ...(isCurrentUserPartOfOrg ? [{ pageName: 'settings' }] : []),
]

const Loader = (
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
  const { gazeboFlagsTab } = useFlags({
    gazeboFlagsTab: false,
  })
  const { data: currentOwner } = useOwner({ username: owner })
  const { data: commitsData } = useCommits({ provider, owner, repo })

  const matchTree = useMatchTreePath()
  const matchBlobs = useMatchBlobsPath()

  const repoHasCommits =
    commitsData?.commits && commitsData?.commits?.length > 0
  const isRepoActivated = repoData?.repository?.activated
  const isCurrentUserPartOfOrg = currentOwner?.isCurrentUserPartOfOrg
  const isRepoPrivate = !!repoData?.repository?.private

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
      <div className="flex flex-col gap-4 h-full">
        <RepoBreadcrumb />
        {repoHasCommits && isRepoActivated && (
          <TabNavigation
            tabs={getRepoTabs({
              matchTree,
              matchBlobs,
              isRepoActivated: repoData?.repository?.activated,
              isCurrentUserPartOfOrg,
              gazeboFlagsTab,
            })}
          />
        )}
        <Suspense fallback={Loader}>
          {isRepoActivated ? (
            <Switch>
              <SentryRoute path={path} exact>
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
              <SentryRoute path={`${path}/tree/:branch/:path+`} exact>
                <CoverageTab />
              </SentryRoute>
              <SentryRoute path={`${path}/tree/:branch`} exact>
                <CoverageTab />
              </SentryRoute>
              <SentryRoute path={`${path}/blob/:ref/:path+`} exact>
                <CoverageTab />
              </SentryRoute>
              <Redirect
                from="/:provider/:owner/:repo/*"
                to="/:provider/:owner/:repo"
              />
            </Switch>
          ) : (
            <>
              {repoHasCommits ? (
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
                  <SentryRoute path={`${path}/new`} exact>
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
