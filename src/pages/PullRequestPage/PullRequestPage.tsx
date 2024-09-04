import qs from 'qs'
import { lazy, Suspense, useLayoutEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCrumbs } from 'pages/RepoPage/context'
import { useRepoOverview } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import SummaryDropdown from 'ui/SummaryDropdown'

import PullBundleDropdown from './Dropdowns/PullBundleDropdown'
import PullCoverageDropdown from './Dropdowns/PullCoverageDropdown'
import Header from './Header'
import { usePullPageData } from './hooks'

const PullCoverage = lazy(() => import('./PullCoverage'))
const PullBundleAnalysis = lazy(() => import('./PullBundleAnalysis'))

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

const DISPLAY_MODE = {
  COVERAGE: 'coverage',
  BUNDLE_ANALYSIS: 'bundle-analysis',
  BOTH: 'both',
} as const

type TDisplayMode = (typeof DISPLAY_MODE)[keyof typeof DISPLAY_MODE]

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullRequestPage() {
  const location = useLocation()
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  const { data: overview } = useRepoOverview({ provider, owner, repo })

  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan = tierData === TierNames.TEAM && overview?.private

  const { data, isLoading } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan,
  })

  const { setBreadcrumbs, setBaseCrumbs } = useCrumbs()
  useLayoutEffect(() => {
    setBaseCrumbs([
      { pageName: 'owner', text: owner },
      {
        pageName: 'repo',
        children: (
          <div
            className="inline-flex items-center gap-1"
            data-testid="breadcrumb-repo"
          >
            {overview?.private && (
              <Icon name="lockClosed" variant="solid" size="sm" />
            )}
            {repo}
          </div>
        ),
      },
    ])
    setBreadcrumbs([
      { pageName: 'pulls', text: 'pulls' },
      {
        pageName: 'pullDetail',
        options: { pullId },
        readOnly: true,
        text: pullId,
      },
    ])
    return () => setBreadcrumbs([])
  }, [setBreadcrumbs, pullId, setBaseCrumbs, owner, repo, overview])

  if (!isLoading && !data?.pull) {
    return <NotFound />
  }

  let defaultDropdown: Array<'coverage' | 'bundle'> = []
  // default to displaying only coverage
  let displayMode: TDisplayMode = DISPLAY_MODE.COVERAGE
  if (data?.bundleAnalysisEnabled && data?.coverageEnabled) {
    const queryString = qs.parse(location.search, {
      ignoreQueryPrefix: true,
      depth: 1,
    })

    if (queryString?.dropdown === 'bundle') {
      defaultDropdown.push('bundle')
    } else if (queryString?.dropdown === 'coverage') {
      defaultDropdown.push('coverage')
    }

    displayMode = DISPLAY_MODE.BOTH
  } else if (data?.bundleAnalysisEnabled) {
    displayMode = DISPLAY_MODE.BUNDLE_ANALYSIS
  }

  return (
    <div className="mx-4 flex flex-col md:mx-0">
      <Header />
      {displayMode === DISPLAY_MODE.BOTH ? (
        <SummaryDropdown type="multiple" defaultValue={defaultDropdown}>
          <PullCoverageDropdown>
            <Suspense fallback={<Loader />}>
              <PullCoverage />
            </Suspense>
          </PullCoverageDropdown>
          <PullBundleDropdown>
            <Suspense fallback={<Loader />}>
              <PullBundleAnalysis />
            </Suspense>
          </PullBundleDropdown>
        </SummaryDropdown>
      ) : displayMode === DISPLAY_MODE.BUNDLE_ANALYSIS ? (
        <Suspense fallback={<Loader />}>
          <PullBundleAnalysis />
        </Suspense>
      ) : (
        <Suspense fallback={<Loader />}>
          <PullCoverage />
        </Suspense>
      )}
    </div>
  )
}

export default PullRequestPage
