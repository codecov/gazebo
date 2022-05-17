import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Commits from './Commits'
import Flags from './Flags'
import Header from './Header'
import CompareSummary from './Summary'

const Root = lazy(() => import('./subroute/Root'))

function PullRequestPage() {
  const { owner, repo, pullId } = useParams()

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

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
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 space-y-2">
        <article className="col-span-2">
          <Switch>
            {/* For second itteration, for now removing the route so inquisitive users dont get into trouble. */}
            {/* <Route
              path="/:provider/:owner/:repo/pull/:pullId/tree/:path+"
              exact
            >
              <Suspense fallback={Loader}>
                <FullFile />
              </Suspense>
            </Route> */}
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
          <Flags />
        </aside>
      </div>
    </div>
  )
}

export default PullRequestPage
