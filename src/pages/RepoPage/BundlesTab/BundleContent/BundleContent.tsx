import { lazy, Suspense, useEffect } from 'react'
import { Route, Switch, useParams } from 'react-router-dom'

import { useBranchBundleSummary } from 'services/bundleAnalysis'
import { metrics } from 'shared/utils/metrics'
import Spinner from 'ui/Spinner'

import AssetsTable from './AssetsTable'
import BundleSummary from './BundleSummary'
import InfoBanner from './InfoBanner'

const AssetEmptyTable = lazy(() => import('./AssetsTable/EmptyTable'))
const ErrorBanner = lazy(() => import('./ErrorBanner'))

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch?: string
  bundle?: string
}

const Loader = () => (
  <div className="mt-16 flex flex-1 items-center justify-center">
    <Spinner />
  </div>
)

const BundleContent: React.FC = () => {
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()

  useEffect(() => {
    metrics.increment('bundles_tab.bundle_details.visited_page', 1)
  }, [])

  const { data } = useBranchBundleSummary({ provider, owner, repo, branch })

  const bundleType = data?.branch?.head?.bundleAnalysisReport?.__typename

  return (
    <div>
      <BundleSummary />
      <Suspense fallback={<Loader />}>
        {bundleType === 'BundleAnalysisReport' ? (
          <Switch>
            <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
              <AssetsTable />
            </Route>
            <Route
              path={[
                '/:provider/:owner/:repo/bundles/:branch',
                '/:provider/:owner/:repo/bundles/',
              ]}
            >
              <InfoBanner branch={branch} bundle={bundle} />
              <AssetEmptyTable />
            </Route>
          </Switch>
        ) : (
          <>
            <ErrorBanner errorType={bundleType} />
            <AssetEmptyTable />
          </>
        )}
      </Suspense>
    </div>
  )
}

export default BundleContent
