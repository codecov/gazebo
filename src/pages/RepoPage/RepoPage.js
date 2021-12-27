import { useParams } from 'react-router-dom'
import { Switch, Route, useLocation } from 'react-router-dom'
import { useRepo } from 'services/repo/hooks'
import Breadcrumb from 'ui/Breadcrumb'
import TabNavigation from 'ui/TabNavigation'

import New from './new'
import PullsPage from './PullsPage'
import CommitsPage from './CommitPage'
import { useCommits } from 'services/commits'
import cs from 'classnames'
import { useEffect, useState } from 'react'

function RepoPage() {
  const { provider, owner, repo } = useParams()

  const { data: commits } = useCommits({ provider, owner, repo })
  const repoHasCommits = commits?.length > 0

  const path = '/:provider/:owner/:repo'
  const { data } = useRepo({
    provider,
    owner,
    repo,
  })

  const { pathname } = useLocation()
  const [paths, setPaths] = useState([])

  useEffect(() => {
    const isCommitsPage = pathname.split('/')[4] === 'commits'
    const paths = isCommitsPage
      ? [
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: '', readOnly: true, text: 'main' }, //TODO
        ]
      : [
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
        ]
    setPaths(paths)
  }, [pathname, owner, repo])

  const { private: privateRepo } = data.repo

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cs('text-xl ml-6 md:ml-0 font-semibold flex flex-row my-4', {
          'border-b pb-8': !repoHasCommits,
          'border-none': repoHasCommits,
        })}
      >
        <Breadcrumb paths={paths} />
        {privateRepo && (
          <span className="ml-2 px-1 py-0.5 h-5 mt-1 border border-ds-gray-tertiary rounded text-xs text-ds-gray-senary font-light">
            Private
          </span>
        )}
      </div>
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
      <div className="flex justify-center">
        <Switch>
          <Route path={path} exact>
            <h1>Overview</h1>
          </Route>
          <Route path={`${path}/new`} exact>
            <New data={data} />
          </Route>
          <Route path={`${path}/commits`} exact>
            <CommitsPage />
          </Route>
          <Route path={`${path}/branches`} exact>
            <h1>Branches</h1>
          </Route>
          <Route path={`${path}/pulls`} exact>
            <PullsPage />
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
