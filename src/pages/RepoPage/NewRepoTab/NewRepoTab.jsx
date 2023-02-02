import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useCommits } from 'services/commits'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

import GitHubActions from './GitHubActions'

const OtherCI = lazy(() => import('./OtherCI'))

const Loader = () => (
  <div className="flex-1 flex items-center justify-center mt-16">
    <Spinner />
  </div>
)

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { hardRedirect } = useRedirect({ href: `/${provider}` })
  const { data } = useRepo({ provider, owner, repo })
  const { data: commitsData } = useCommits({ provider, owner, repo })

  // if the repo has commits redirect to coverage tab
  if (Array.isArray(commitsData?.commits) && commitsData?.commits.length > 0) {
    return <Redirect to={`/${provider}/${owner}/${repo}`} />
  }
  // if no upload token redirect
  else if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-6">
      <hr />
      <div className="mx-auto w-4/5 md:w-3/5 lg:w-3/6 mt-6">
        <h1 className="font-semibold text-3xl mb-4">
          Let&apos;s get your repo covered
        </h1>
        <TabNavigation
          tabs={[
            { pageName: 'new', children: 'GitHub Actions', exact: true },
            { pageName: 'newOtherCI' },
          ]}
        />
        <div className="mt-6">
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/new" exact>
              <GitHubActions />
            </SentryRoute>
            <SentryRoute path="/:provider/:owner/:repo/new/other-ci">
              <Suspense fallback={<Loader />}>
                <OtherCI />
              </Suspense>
            </SentryRoute>
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default NewRepoTab
