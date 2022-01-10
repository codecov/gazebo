import { lazy, Suspense } from 'react'
import { useParams, Switch, Route } from 'react-router-dom'

import { useCommits } from 'services/commits'

import LogoSpinner from 'old_ui/LogoSpinner'
import TabNavigation from 'ui/TabNavigation'

import { RepoBreadcrumbProvider } from './context'
import RepoBreadcrumb from './RepoBreadcrumb'

const NewRepoTab = lazy(() => import('./NewRepoTab'))
const PullsTab = lazy(() => import('./PullsTab'))
const CommitsTab = lazy(() => import('./CommitsTab'))

const path = '/:provider/:owner/:repo'

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const { data: commits } = useCommits({ provider, owner, repo })
  const repoHasCommits = commits?.length > 0

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
                pageName: 'compare',
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
              <h1>Overview</h1>
            </Route>
            <Route path={`${path}/new`} exact>
              <NewRepoTab />
            </Route>
            <Route path={`${path}/commits`} exact>
              <CommitsTab />
            </Route>
            <Route path={`${path}/branches`} exact>
              <h1>Branches</h1>
            </Route>
            <Route path={`${path}/pulls`} exact>
              <PullsTab />
            </Route>
            <Route path={`${path}/compare`} exact>
              <h1>Compare</h1>
            </Route>
            <Route path={`${path}/settings`} exact>
              <h1>Settings</h1>
            </Route>
          </Switch>
        </Suspense>
      </div>
    </RepoBreadcrumbProvider>
  )
}

export default RepoPage
