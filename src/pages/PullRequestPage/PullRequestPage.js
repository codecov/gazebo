import { lazy, Suspense } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router-dom'

import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Card from './Card'
import CompareSummary from './CompareSummary'
import Header from './Header'

const FileDiff = lazy(() => import('./subroute/FileDiff'))
const Root = lazy(() => import('./subroute/Root'))

function PullRequestPage() {
  const { owner, repo, pullid } = useParams()

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
            pageName: 'pull',
            options: { pullid },
            readOnly: true,
            text: pullid,
          },
        ]}
      />
      <Header />
      <CompareSummary />
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 space-y-2">
        <div className="col-span-2">
          <Switch>
            <Route
              path="/:provider/:owner/:repo/pull/:pullid/tree/:path+"
              exact
            >
              <Suspense fallback={Loader}>
                <FileDiff />
              </Suspense>
            </Route>
            <Route path="/:provider/:owner/:repo/pull/:pullid" exact={true}>
              <Suspense fallback={Loader}>
                <Root />
              </Suspense>
            </Route>
            <Redirect
              from="/:provider/:owner/:repo/pull/:pullid/*"
              to="/:provider/:owner/:repo/pull/:pullid"
            />
          </Switch>
        </div>
        <div className="flex flex-col gap-4">
          {/* Placeholder, make each card is own component importing the pre styled card */}
          <Card title="Coverage Report">
            <p>Test</p>
          </Card>
          <Card title="Commits">
            <p>Test</p>
          </Card>
          <Card title="Flags">
            <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p>{' '}
            <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p>{' '}
            <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p>{' '}
            <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p> <p>Test</p>{' '}
            <p>Test</p> <p>Test</p> <p>Test</p>{' '}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PullRequestPage
