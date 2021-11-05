import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import { useRouteMatch, Switch, Route } from 'react-router-dom'
import { useRepo } from 'services/repo/hooks'
import New from './new'
import RepoErrorHandler from './RepoErrorHandler'
import { Redirect } from 'react-router'

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const { url } = useRouteMatch()
  const { data } = useRepo({
    provider,
    owner,
    repo,
  })

  if (!data) {
    return <RepoErrorHandler />
  }

  const { private: privateRepo } = data.repo

  return (
    <div className="flex flex-col">
      <div className="text-xl ml-6 md:ml-0 mb-6 font-semibold flex flex-row pb-8 border-b border-ds-gray-tertiary">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
          ]}
        />
        {privateRepo && (
          <span className="ml-2 px-1 py-0.5 h-5 mt-1 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary font-light">
            Private
          </span>
        )}
      </div>
      <div className="flex justify-center">
        <Switch>
          <Route path={url} exact>
            <h1>Overview</h1>
          </Route>
          <Route path={`${url}/new`} exact>
            <New data={data} />
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
          <Route path={`${url}/*`}>
            <Redirect to={url} />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default RepoPage
