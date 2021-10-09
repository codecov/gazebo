import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import TabNavigation from 'ui/TabNavigation'
import { useRouteMatch, Switch, Route } from 'react-router-dom'

function RepoPage() {
  const { owner, repo } = useParams()
  const { path, url } = useRouteMatch()

  return (
    <div className="flex flex-col p-0">
      <div className="text-lg h-24">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
          ]}
        />
      </div>
      <div className="mt-4 mb-8">
        <TabNavigation
          tabs={[
            { pageName: 'overview' },
            { pageName: 'commits' },
            { pageName: 'branches' },
            { pageName: 'pulls' },
            { pageName: 'compare' },
            { pageName: 'settings' },
          ]}
        />
      </div>
      <Switch>
        <Route exact path={path}>
          <h3>Overview</h3>
        </Route>
        <Route path={`${url}/commits`} exact>
          <h1>Commmits here </h1>
        </Route>
        <Route path={`${url}/branches`} exact>
          <h1>Branches here</h1>
        </Route>
        <Route path={`${url}/pulls`} exact>
          <h1>Pulls here</h1>
        </Route>
        <Route path={`${url}/compare`} exact>
          <h1>Compare here</h1>
        </Route>
        <Route path={`${url}/settings`} exact>
          <h1>Settings here</h1>
        </Route>
      </Switch>
    </div>
  )
}

export default RepoPage
