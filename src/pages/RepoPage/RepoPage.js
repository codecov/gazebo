import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import { useRouteMatch, Switch, Route } from 'react-router-dom'

function RepoPage() {
  const { owner, repo } = useParams()
  const { path, url } = useRouteMatch()

  return (
    <div className="flex flex-col p-0">
      <div className="text-xl mb-6 font-semibold">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
          ]}
        />
      </div>
      <Switch>
        <Route exact path={path}>
          <h3>Overview</h3>
        </Route>
        <Route path={`${url}/commits`} exact>
          <h1>Commmits</h1>
        </Route>
        <Route path={`${url}/branches`} exact>
          <h1>Branches</h1>
        </Route>
        <Route path={`${url}/pulls`} exact>
          <h1>Pulls</h1>
        </Route>
        <Route path={`${url}/compare`} exact>
          <h1>Compare</h1>
        </Route>
        <Route path={`${url}/settings`} exact>
          <h1>Settings</h1>
        </Route>
      </Switch>
    </div>
  )
}

export default RepoPage
