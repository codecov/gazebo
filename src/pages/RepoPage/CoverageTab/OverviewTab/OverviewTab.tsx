import { lazy, Suspense } from 'react'
import { Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useRepo } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import { cn } from 'shared/utils/cn'
import Spinner from 'ui/Spinner'

import FirstPullRequestBanner from './FirstPullRequestBanner'
import { useCoverageTabData } from './hooks/useCoverageTabData'
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

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
}

function CoverageOverviewTab() {
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: tierName } = useTier({ provider, owner })

  const { data } = useCoverageTabData({
    provider,
    owner,
    repo,
    branch: branch,
  })

  let displaySunburst = false
  const fileCount = data?.branch?.head?.totals?.fileCount
  if (typeof fileCount === 'number' && fileCount <= 200_000) {
    displaySunburst = true
  }

  const showTeamSummary =
    tierName === TierNames.TEAM &&
    repoData?.repository?.private &&
    multipleTiers

  return (
    <div className="mx-4 flex flex-col gap-4 divide-y border-solid border-ds-gray-secondary pt-4 sm:mx-0">
      {repoData?.repository?.isFirstPullRequest ? (
        <FirstPullRequestBanner />
      ) : null}
      {showTeamSummary ? <SummaryTeamPlan /> : <Summary />}
      <div className="flex flex-col gap-4 ">
        {!showTeamSummary ? (
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
                showElement="Show charts"
                hideElement="Hide charts"
                localStorageKey="is-chart-hidden"
              >
                <div
                  className={cn('inline-table', {
                    'col-span-9': displaySunburst,
                    'col-span-12 h-[21rem]': !displaySunburst,
                  })}
                >
                  <SilentNetworkErrorWrapper>
                    <CoverageChart extendedChart={!displaySunburst} />
                  </SilentNetworkErrorWrapper>
                </div>
                {displaySunburst ? (
                  <div className="sticky top-32 col-span-3 flex aspect-square flex-col justify-center gap-4 px-8 py-4">
                    <Sunburst />
                  </div>
                ) : null}
              </ToggleElement>
            </Suspense>
          </SentryRoute>
        ) : null}
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
    </div>
  )
}

export default CoverageOverviewTab
