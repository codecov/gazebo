import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useRepoOverview } from 'services/repo'
import Spinner from 'ui/Spinner'

const BundleContent = lazy(() => import('./BundleContent'))
const BundleOnboarding = lazy(() => import('./BundleOnboarding'))

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

const path = '/:provider/:owner/:repo/bundles'

const BundlesTab: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepoOverview({ provider, owner, repo })

  if (data?.bundleAnalysisEnabled) {
    return (
      <Suspense fallback={<Loader />}>
        <BundleContent />
      </Suspense>
    )
  }

  if (data?.jsOrTsPresent) {
    return (
      <>
        <Switch>
          <SentryRoute
            path={[`${path}/new`, `${path}/new/rollup`, `${path}/new/webpack`]}
          >
            <Suspense fallback={<Loader />}>
              <BundleOnboarding />
            </Suspense>
          </SentryRoute>
        </Switch>
      </>
    )
  }

  return null
}

export default BundlesTab
