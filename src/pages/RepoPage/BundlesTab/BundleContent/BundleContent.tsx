import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useBranchBundleSummary } from 'services/bundleAnalysis/useBranchBundleSummary'
import Spinner from 'ui/Spinner'
import { ToggleElement } from 'ui/ToggleElement'

import AssetsTable from './AssetsTable'
import { EmptyTable as AssetEmptyTable } from './AssetsTable/EmptyTable'
import { BundleChart } from './BundleChart'
import { BundleDetails, NoDetails } from './BundleDetails'
import BundleSelection from './BundleSelection'
import InfoBanner from './InfoBanner'
import { TrendDropdown } from './TrendDropdown'

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

  const { data } = useBranchBundleSummary({ provider, owner, repo, branch })

  const bundleType =
    data?.branch?.head?.bundleAnalysis?.bundleAnalysisReport?.__typename

  return (
    <div>
      <BundleSelection />
      <Suspense fallback={<NoDetails />}>
        <BundleDetails />
      </Suspense>
      <Suspense fallback={<Loader />}>
        {bundleType === 'BundleAnalysisReport' ? (
          <Switch>
            <SentryRoute path="/:provider/:owner/:repo/bundles/:branch/:bundle">
              <ToggleElement
                showButtonContent="Show chart"
                hideButtonContent="Hide chart"
                localStorageKey="is-bundle-chart-hidden"
                toggleRowElement={<TrendDropdown />}
              >
                <BundleChart />
              </ToggleElement>
              <Suspense fallback={<Loader />}>
                <AssetsTable />
              </Suspense>
            </SentryRoute>
            <SentryRoute
              path={[
                '/:provider/:owner/:repo/bundles/:branch',
                '/:provider/:owner/:repo/bundles/',
              ]}
            >
              <InfoBanner branch={branch} bundle={bundle} />
              <AssetEmptyTable />
            </SentryRoute>
          </Switch>
        ) : bundleType === undefined && !branch ? (
          <>
            <InfoBanner branch={branch} bundle={bundle} />
            <AssetEmptyTable />
          </>
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
