import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import { providerToName } from 'shared/utils'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

import ActivationBanner from './ActivationBanner'
import CircleCI from './CircleCI'
import GitHubActions from './GitHubActions'
import IntroBlurb from './IntroBlurb'

const OtherCI = lazy(() => import('./OtherCI'))

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

function Content({
  provider,
  isCurrentUserActivated,
}: {
  provider: string
  isCurrentUserActivated: boolean
}) {
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
      {!isCurrentUserActivated ? <ActivationBanner /> : null}
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

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function NewRepoTab() {
  const { provider, owner, repo } = useParams<URLParams>()
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
      <div className="flex flex-col gap-4 pt-4 lg:w-3/5">
        <IntroBlurb />
        <Content
          provider={provider}
          isCurrentUserActivated={data?.isCurrentUserActivated ?? false}
        />
      </div>
    </div>
  )
}

export default NewRepoTab
