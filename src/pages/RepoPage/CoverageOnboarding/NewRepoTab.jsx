import PropTypes from 'prop-types'
import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import { providerToName } from 'shared/utils'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

import CircleCI from './CircleCI'
import GitHubActions from './GitHubActions'

const OtherCI = lazy(() => import('./OtherCI'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

function Content({ provider }) {
  if (providerToName(provider) !== 'Github') {
    return (
      <div className="mt-6">
        <Suspense fallback={<Loader />}>
          <OtherCI />
        </Suspense>
      </div>
    )
  }

  return (
    <>
      <TabNavigation
        tabs={[
          { pageName: 'new', children: 'GitHub Actions', exact: true },
          { pageName: 'circleCI' },
          { pageName: 'newOtherCI' },
        ]}
      />
      <div className="mt-6">
        <Switch>
          <SentryRoute path="/:provider/:owner/:repo/new" exact>
            <GitHubActions />
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/new/circle-ci" exact>
            <CircleCI />
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/new/other-ci" exact>
            <Suspense fallback={<Loader />}>
              <OtherCI />
            </Suspense>
          </SentryRoute>
        </Switch>
      </div>
    </>
  )
}

Content.propTypes = {
  provider: PropTypes.string,
}

function NewRepoTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { hardRedirect } = useRedirect({ href: `/${provider}` })

  // if no upload token redirect
  // also have a component render incase redirect isn't fast enough
  if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-4/5 pt-4 md:w-3/5 lg:w-3/6">
        <h1 className="pb-4 text-3xl font-semibold">
          Let&apos;s get your repo covered
        </h1>
        <Content provider={provider} />
      </div>
    </div>
  )
}

export default NewRepoTab
