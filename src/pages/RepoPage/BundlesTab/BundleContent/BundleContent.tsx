import { lazy, Suspense, useEffect, useLayoutEffect } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCrumbs } from 'pages/RepoPage/context'
import { useBranchBundleSummary } from 'services/bundleAnalysis'
import { metrics } from 'shared/utils/metrics'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import AssetsTable from './AssetsTable'
import { BundleChart } from './BundleChart'
import { BundleDetails, NoDetails } from './BundleDetails'
import BundleSelection from './BundleSelection'
import InfoBanner from './InfoBanner'
import { ToggleElement } from './ToggleElement'
import { TrendDropdown } from './TrendDropdown'

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
  const { setBreadcrumbs } = useCrumbs()

  useEffect(() => {
    metrics.increment('bundles_tab.bundle_details.visited_page', 1)
  }, [])

  const { data } = useBranchBundleSummary({ provider, owner, repo, branch })

  useLayoutEffect(() => {
    setBreadcrumbs([
      {
        pageName: '',
        readOnly: true,
        children: (
          <span className="inline-flex items-center gap-1">
            <Icon name="branch" variant="developer" size="sm" />
            {decodeURIComponent(branch ?? '')}
          </span>
        ),
      },
    ])
  }, [branch, setBreadcrumbs])

  const bundleType = data?.branch?.head?.bundleAnalysisReport?.__typename

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
