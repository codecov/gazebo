import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import LogoSpinner from 'old_ui/LogoSpinner'
import { useCommits } from 'services/commits'
import TabNavigation from 'ui/TabNavigation'

import { RepoBreadcrumbProvider } from './context'
import RepoBreadcrumb from './RepoBreadcrumb'
import SettingsTab from './SettingsTab'

const CommitsTab = lazy(() => import('./CommitsTab'))
const CoverageTab = lazy(() => import('./CoverageTab'))
const NewRepoTab = lazy(() => import('./NewRepoTab'))
const PullsTab = lazy(() => import('./PullsTab'))

const path = '/:provider/:owner/:repo'

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const { data } = useCommits({ provider, owner, repo })

  const repoHasCommits = data?.commits?.length > 0

  const Loader = (
    <div className="flex-1 flex items-center justify-center mt-16">
      <LogoSpinner />
    </div>
  )

  return (
    <RepoBreadcrumbProvider>
      <div className="flex flex-col gap-4">
        <RepoBreadcrumb />
        {repoHasCommits && (
          <TabNavigation
            tabs={[
              {
                pageName: 'overview',
                children: 'Coverage',
                exact: true,
              },
              {
                pageName: 'commits',
              },
              {
                pageName: 'pulls',
              },
              {
                pageName: 'settings',
              },
            ]}
          />
        )}
        <Suspense fallback={Loader}>
          <Switch>
            <Route path={path} exact>
              <CoverageTab />
            </Route>
            <Route path={`${path}/new`} exact>
              <NewRepoTab />
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
            <Route path={`${path}/tree/:path+`} exact>
              <CoverageTab />
            </Route>
            <Route path={`${path}/blobs/:ref/*`} exact>
              <CoverageTab />
            </Route>
            <Redirect
              from="/:provider/:owner/:repo/*"
              to="/:provider/:owner/:repo"
            />
          </Switch>
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
