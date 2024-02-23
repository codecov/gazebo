import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useRepo } from 'services/repo'
import { useRedirect } from 'shared/useRedirect'
import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

const ViteOnboarding = lazy(() => import('./ViteOnboarding'))
const RollupOnboarding = lazy(() => import('./RollupOnboarding'))
const WebpackOnboarding = lazy(() => import('./WebpackOnboarding'))

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const Content: React.FC = () => {
  return (
    <>
      <TabNavigation
        tabs={[
          { pageName: 'bundleOnboarding', exact: true },
          { pageName: 'bundleRollupOnboarding' },
          { pageName: 'bundleWebpackOnboarding' },
        ]}
      />
      <Switch>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new" exact>
          <Suspense fallback={<Loader />}>
            <ViteOnboarding />
          </Suspense>
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/rollup">
          <Suspense fallback={<Loader />}>
            <RollupOnboarding />
          </Suspense>
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/bundles/new/webpack">
          <Suspense fallback={<Loader />}>
            <WebpackOnboarding />
          </Suspense>
        </SentryRoute>
      </Switch>
    </>
  )
}

const BundleOnboarding: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepo({ provider, owner, repo })
  const { hardRedirect } = useRedirect({ href: `/${provider}` })

  // if no upload token redirect
  if (!data?.repository?.uploadToken) {
    hardRedirect()
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-4/5 pt-6 md:w-3/5 lg:w-3/6">
        <h1 className="mb-2 text-3xl font-semibold">
          Configure bundle analysis
        </h1>
        <Content />
      </div>
    </div>
  )
}

export default BundleOnboarding
