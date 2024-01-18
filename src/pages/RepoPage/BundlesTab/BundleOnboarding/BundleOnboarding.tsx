import { lazy, Suspense } from 'react'
import { Switch } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import Spinner from 'ui/Spinner'
import TabNavigation from 'ui/TabNavigation'

const ViteOnboarding = lazy(() => import('./ViteOnboarding'))

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
      </Switch>
    </>
  )
}

const BundleOnboarding: React.FC = () => {
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
