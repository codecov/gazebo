import { lazy, Suspense } from 'react'
import { Route, Switch, useParams } from 'react-router-dom'

import { useBranchBundleSummary } from 'services/bundleAnalysis'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import AssetsTable from './AssetsTable'
import BundleSummary from './BundleSummary'
import BundleSummaryOld from './BundleSummaryOld'

const EmptyTable = lazy(() => import('./EmptyTable'))
const AssetEmptyTable = lazy(() => import('./AssetsTable/EmptyTable'))
const ErrorBanner = lazy(() => import('./ErrorBanner'))
const BundleTable = lazy(() => import('./BundleTable'))

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

const BundleContent: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { newBundleTab } = useFlags({
    newBundleTab: false,
  })

  const { data } = useBranchBundleSummary({ provider, owner, repo })

  const bundleType = data?.branch?.head?.bundleAnalysisReport?.__typename

  return (
    <div>
      {newBundleTab ? <BundleSummary /> : <BundleSummaryOld />}
      <Suspense fallback={<Loader />}>
        {bundleType === 'BundleAnalysisReport' ? (
          newBundleTab ? (
            <Switch>
              <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
                <AssetsTable />
              </Route>
              <Route>
                <AssetEmptyTable />
              </Route>
            </Switch>
          ) : (
            <BundleTable />
          )
        ) : newBundleTab ? (
          <>
            <ErrorBanner errorType={bundleType} />
            <AssetEmptyTable />
          </>
        ) : (
          <>
            <ErrorBanner errorType={bundleType} />
            <EmptyTable />
          </>
        )}
      </Suspense>
    </div>
  )
}

export default BundleContent
