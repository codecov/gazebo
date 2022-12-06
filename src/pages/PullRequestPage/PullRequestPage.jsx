import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import NotFound from 'pages/NotFound'
import { usePull } from 'services/pull'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Commits from './Commits'
import ErrorBanner from './ErrorBanner'
import { ComparisonReturnType } from './ErrorBanner/constants.js'
import Flags from './Flags'
import Header from './Header'
import CompareSummary from './Summary'

const Root = lazy(() => import('./subroute/Root'))

// eslint-disable-next-line complexity
function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { data, isLoading } = usePull({ provider, owner, repo, pullId })

  const Loader = (
    <div className="flex items-center justify-center py-16">
      <Spinner />
    </div>
  )

  if ((!isLoading && !data?.hasAccess) || (!isLoading && !data?.pull)) {
    return <NotFound />
  }

  const resultType = data?.pull?.compareWithBase?.__typename

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
      {resultType !== ComparisonReturnType.SUCCESFUL_COMPARISON ? (
        <ErrorBanner errorType={resultType} />
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 space-y-2">
          <article className="col-span-2">
            <Switch>
              <SentryRoute
                path="/:provider/:owner/:repo/pull/:pullId"
                exact={true}
              >
                <Suspense fallback={Loader}>
                  <Root />
                </Suspense>
              </SentryRoute>
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
      )}
    </div>
  )
}

export default PullRequestPage
