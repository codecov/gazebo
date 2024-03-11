import { lazy, Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import { metrics } from 'shared/utils/metrics'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
import ErrorBanner from './ErrorBanner'
import FirstPullBanner from './FirstPullBanner'

import { TBundleAnalysisComparisonResult, usePullPageData } from '../hooks'

const PullBundleComparisonTable = lazy(
  () => import('./PullBundleComparisonTable')
)
const PullBundleHeadTable = lazy(() => import('./PullBundleHeadTable'))

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

interface BundleContentProps {
  bundleCompareType?: TBundleAnalysisComparisonResult
  headHasBundle?: boolean
}

const BundleContent: React.FC<BundleContentProps> = ({
  bundleCompareType,
  headHasBundle,
}) => {
  if (bundleCompareType === 'FirstPullRequest') {
    return (
      <>
        <FirstPullBanner />
        <EmptyTable />
      </>
    )
  }

  if (headHasBundle && bundleCompareType !== 'BundleAnalysisComparison') {
    return (
      <>
        <ErrorBanner errorType={bundleCompareType} />
        <PullBundleHeadTable />
      </>
    )
  }

  if (bundleCompareType !== 'BundleAnalysisComparison') {
    return (
      <>
        <ErrorBanner errorType={bundleCompareType} />
        <EmptyTable />
      </>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <PullBundleComparisonTable />
    </Suspense>
  )
}

const PullBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  // we can set team plan true here because we don't care about the fields it will skip - tho we should really stop doing this and just return null on the API if they're on a team plan so we can save on requests made
  const { data } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan: true,
  })

  useEffect(() => {
    if (overview?.bundleAnalysisEnabled && overview?.coverageEnabled) {
      metrics.increment('pull_request_page.bundle_dropdown.opened', 1)
    } else if (overview?.bundleAnalysisEnabled) {
      metrics.increment('pull_request_page.bundle_page.visited_page', 1)
    }
  }, [overview?.bundleAnalysisEnabled, overview?.coverageEnabled])

  const bundleCompareType =
    data?.pull?.bundleAnalysisCompareWithBase?.__typename
  const headHasBundle =
    data?.pull?.head?.bundleAnalysisReport?.__typename ===
    'BundleAnalysisReport'

  if (data?.coverageEnabled && data?.bundleAnalysisEnabled) {
    return (
      <BundleContent
        bundleCompareType={bundleCompareType}
        headHasBundle={headHasBundle}
      />
    )
  }

  return (
    <>
      <div className="flex w-full flex-col items-start bg-ds-gray-primary px-2 py-4 text-base">
        <BundleMessage />
      </div>
      <BundleContent
        bundleCompareType={bundleCompareType}
        headHasBundle={headHasBundle}
      />
    </>
  )
}

export default PullBundleAnalysis
