import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import { useRouteMatch, Switch, Route } from 'react-router-dom'
import { useRepo } from 'services/repo/hooks'
import Spinner from 'ui/Spinner'

function RepoPage() {
  const { provider, owner, repo } = useParams()
  const { path, url } = useRouteMatch()
  const { data, isLoading } = useRepo({
    provider,
    owner,
    repo,
    query: '',
    opts: {
      suspense: false,
      staleTime: 0,
      keepPreviousData: false,
    },
  })

  if (isLoading) {
    return <Spinner />
  }

  const { private: privateRepo } = data

  return (
    <div className="flex flex-col">
      <div className="text-xl mb-6 font-semibold flex flex-row pb-8 border-b border-ds-gray-tertiary">
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
      <Switch>
        <Route exact path={path}>
          <h3>Overview1</h3>
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
