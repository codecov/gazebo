import cs from 'classnames'
import { lazy, Suspense } from 'react'
import { Switch } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import Summary from './Summary'
import ToggleElement from './ToggleElement'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const RepoContentsTable = lazy(() => import('./subroute/RepoContents'))
const CoverageChart = lazy(() => import('./subroute/CoverageChart'))
const Sunburst = lazy(() => import('./subroute/Sunburst'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CoverageTab() {
  const { coverageSunburstChart } = useFlags({ coverageSunburstChart: false })
  return (
    <div className="mx-4 flex flex-col gap-2 divide-y border-solid border-ds-gray-secondary sm:mx-0">
      <Summary />
      <SentryRoute
        path={[
          '/:provider/:owner/:repo/tree/:branch/:path+',
          '/:provider/:owner/:repo/tree/:branch',
          '/:provider/:owner/:repo',
        ]}
        exact
      >
        <Suspense fallback={null}>
          <ToggleElement
            showElement="Show Chart"
            hideElement="Hide Chart"
            localStorageKey="is-chart-hidden"
          >
            <div
              className={cs('inline-table', {
                'col-span-9': coverageSunburstChart,
                'col-span-12': !coverageSunburstChart,
              })}
            >
              <SilentNetworkErrorWrapper>
                <CoverageChart />
              </SilentNetworkErrorWrapper>
            </div>
            {coverageSunburstChart && (
              <div className="sticky top-[8rem] col-span-3 flex aspect-square flex-col justify-center gap-4 px-8 py-4">
                <Sunburst />
              </div>
            )}
          </ToggleElement>
        </Suspense>
      </SentryRoute>
      <Switch>
        <SentryRoute path="/:provider/:owner/:repo/blob/:ref/:path+" exact>
          <Suspense fallback={<Loader />}>
            <div className="flex flex-1 flex-col gap-2">
              <FileViewer />
            </div>
          </Suspense>
        </SentryRoute>
        <SentryRoute
          path={[
            '/:provider/:owner/:repo/tree/:branch/:path+',
            '/:provider/:owner/:repo/tree/:branch',
            '/:provider/:owner/:repo',
          ]}
          exact
        >
          <Suspense fallback={<Loader />}>
            <RepoContentsTable />
          </Suspense>
        </SentryRoute>
      </Switch>
    </div>
  )
}

export default CoverageTab
