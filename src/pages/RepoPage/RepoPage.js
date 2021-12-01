import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import { Switch, Route } from 'react-router-dom'
import { useRepo } from 'services/repo/hooks'
import New from './new'

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const path = '/:provider/:owner/:repo'
  const { data } = useRepo({
    provider,
    owner,
    repo,
  })

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
          <Route path={path} exact>
            <h1>Overview</h1>
          </Route>
          <Route path={`${path}/new`} exact>
            <New data={data} />
          </Route>
          <Route path={`${path}/commits`} exact>
            <h1>Commmits</h1>
          </Route>
          <Route path={`${path}/branches`} exact>
            <h1>Branches</h1>
          </Route>
          <Route path={`${path}/pulls`} exact>
            <h1>Pulls</h1>
          </Route>
          <Route path={`${path}/compare`} exact>
            <h1>Compare</h1>
          </Route>
          <Route path={`${path}/settings`} exact>
            <h1>Settings</h1>
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default RepoPage
