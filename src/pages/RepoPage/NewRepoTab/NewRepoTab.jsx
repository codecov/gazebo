import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import { providerToName } from 'shared/utils'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

import GitHubActions from './GitHubActions'

const OtherCI = lazy(() => import('./OtherCI'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { hardRedirect } = useRedirect({ href: `/${provider}` })
  const { data } = useRepo({ provider, owner, repo })

  // if the repo has commits redirect to coverage tab
  if (data?.repository?.active) {
    return <Redirect to={`/${provider}/${owner}/${repo}`} />
  }
  // if no upload token redirect
  else if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }
  // if user is not on gh as a provider
  else if (providerToName(provider) !== 'Github') {
    return <Redirect to={`/${provider}/${owner}/${repo}/new/other-ci`} />
  }

  return (
    <div className="flex flex-col gap-6">
      <hr />
      <div className="mx-auto mt-6 w-4/5 md:w-3/5 lg:w-3/6">
        <h1 className="mb-4 text-3xl font-semibold">
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
