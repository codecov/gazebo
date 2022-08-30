import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
import { usePull } from 'services/pull'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Commits from './Commits'
import Flags from './Flags'
import Header from './Header'
import CompareSummary from './Summary'

const Root = lazy(() => import('./subroute/Root'))

function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { data, isLoading } = usePull({ provider, owner, repo, pullId })

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  if (!data?.hasAccess && !isLoading) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'pulls', text: 'Pulls' },
          {
            pageName: 'pullDetail',
            options: { pullId },
            readOnly: true,
            text: pullId,
          },
        ]}
      />
      <Header />
      <CompareSummary />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 space-y-2">
        <article className="col-span-2">
          <Switch>
            <Route path="/:provider/:owner/:repo/pull/:pullId" exact={true}>
              <Suspense fallback={Loader}>
                <Root />
              </Suspense>
            </Route>
            <Redirect
              from="/:provider/:owner/:repo/pull/:pullId/*"
              to="/:provider/:owner/:repo/pull/:pullId"
            />
          </Switch>
        </article>
        <aside className="flex flex-col gap-4 self-start sticky top-1.5">
          <Commits />
          <SilentNetworkErrorWrapper>
            <Flags />
          </SilentNetworkErrorWrapper>
        </aside>
      </div>
    </div>
  )
}

export default PullRequestPage
