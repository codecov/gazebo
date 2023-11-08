import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import Summary from './Summary'
import SummaryTeamPlan from './SummaryTeamPlan'
import ToggleElement from './ToggleElement'

const FileViewer = lazy(() => import('./subroute/Fileviewer'))
const FileExplorer = lazy(() => import('./subroute/FileExplorer'))
const CoverageChart = lazy(() => import('./subroute/CoverageChart'))
const Sunburst = lazy(() => import('./subroute/Sunburst'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CoverageTab() {
  const { data: repoData } = useRepoSettingsTeam()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { provider, owner } = useParams()
  const { data: tierName } = useTier({ provider, owner })

  const showTeamSummary =
    tierName === TierNames.TEAM &&
    repoData?.repository?.private &&
    multipleTiers

  return (
    <div className="mx-4 flex flex-col gap-2 divide-y border-solid border-ds-gray-secondary sm:mx-0">
      {showTeamSummary ? <SummaryTeamPlan /> : <Summary />}
      {!showTeamSummary && (
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
              <div className="col-span-9 inline-table">
                <SilentNetworkErrorWrapper>
                  <CoverageChart />
                </SilentNetworkErrorWrapper>
              </div>
              <div className="sticky top-[8rem] col-span-3 flex aspect-square flex-col justify-center gap-4 px-8 py-4">
                <Sunburst />
              </div>
            </ToggleElement>
          </Suspense>
        </SentryRoute>
      )}
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
            <FileExplorer />
          </Suspense>
        </SentryRoute>
      </Switch>
    </div>
  )
}

export default CoverageTab
