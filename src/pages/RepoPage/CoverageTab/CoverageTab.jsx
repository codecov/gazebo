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
const Chart = lazy(() => import('./subroute/Chart'))
const Sunburst = lazy(() => import('./subroute/Sunburst'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

const Placeholder = () => (
  <div
    data-testid="placeholder"
    className=" w-full h-full animate-pulse bg-ds-gray-tertiary rounded-full"
  />
)

function CoverageTab() {
  const { coverageSunburstChart } = useFlags({ coverageSunburstChart: false })
  return (
    <div className="flex flex-col gap-2 mx-4 sm:mx-0 divide-y border-solid border-ds-gray-secondary">
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
                <Chart />
              </SilentNetworkErrorWrapper>
            </div>
            {coverageSunburstChart && (
              <div className="col-span-3 aspect-square sticky top-[8rem] flex-col gap-4 p-8">
                <SilentNetworkErrorWrapper>
                  <Suspense fallback={<Placeholder />}>
                    <Sunburst />
                  </Suspense>
                </SilentNetworkErrorWrapper>
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
