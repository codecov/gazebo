import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import LogoSpinner from 'old_ui/LogoSpinner'
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
  const isRepoPrivate = repoData?.repository?.private

  // if the repo is private and the user is not associated
  // then hard redirect to provider
  if (isRepoPrivate && !isCurrentUserPartOfOrg) {
    return <Redirect to={`/${provider}`} />
  }
  // if the repo has no commits redirect to new repo page
  else if (!repoHasCommits) {
    return <Redirect to={`/${provider}/${owner}/${repo}/new`} />
  }
  // if there is no repo data
  else if (!repoData?.repository) {
    return <Redirect to={`/${provider}`} />
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
              <Route path={path} exact>
                <CoverageTab />
              </Route>
              {/* TODO: Move to it's own layout */}
              <Route path={`${path}/new`} exact>
                <NewRepoTab />
              </Route>
              <Route path={`${path}/flags`} exact>
                <FlagsTab />
              </Route>
              <Route path={`${path}/commits`} exact>
                <CommitsTab />
              </Route>
              <Route path={`${path}/pulls`} exact>
                <PullsTab />
              </Route>
              <Redirect from={`${path}/compare`} to={`${path}/pulls`} />
              <Route path={`${path}/settings`}>
                <SettingsTab />
              </Route>
              <Route path={`${path}/tree/:branch/:path+`} exact>
                <CoverageTab />
              </Route>
              <Route path={`${path}/tree/:branch`} exact>
                <CoverageTab />
              </Route>
              <Route path={`${path}/blob/:ref/:path+`} exact>
                <CoverageTab />
              </Route>
              <Redirect
                from="/:provider/:owner/:repo/*"
                to="/:provider/:owner/:repo"
              />
            </Switch>
          ) : (
            <Switch>
              <Route path={`${path}/settings`}>
                <SettingsTab />
              </Route>
              <Route path={`${path}`}>
                <DeactivatedRepo />
              </Route>
            </Switch>
          )}
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
