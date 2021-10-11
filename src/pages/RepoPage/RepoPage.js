import { useParams } from 'react-router-dom'
import Breadcrumb from 'ui/Breadcrumb'
import TabNavigation from 'ui/TabNavigation'
import { useRouteMatch, Switch, Route } from 'react-router-dom'
import { useRepo } from 'services/repo/hooks'

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
  console.log(isLoading ? 'still loading' : data)

  return (
    <div className="flex flex-col">
      <div className="text-xl mb-6 font-semibold flex flex-row">
        <Breadcrumb
          paths={[
            { pageName: 'owner', text: owner },
            { pageName: 'repo', text: repo },
          ]}
        />
        {/* {data?.results[0]?.private && (
          <span className="ml-2 px-1 py-0.5 h-5 mt-1 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary font-light">
            Private
          </span>
        )} */}
      </div>
      <div className="mt-0 mb-8">
        <TabNavigation
          tabs={[{ pageName: 'overview' }, { pageName: 'settings' }]}
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
