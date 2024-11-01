import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import { ReportUploadType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
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
        <ComparisonErrorBanner
          errorType={bundleCompareType}
          reportType={ReportUploadType.BUNDLE_ANALYSIS}
        />
        <PullBundleHeadTable />
      </>
    )
  }

  if (bundleCompareType !== 'BundleAnalysisComparison') {
    return (
      <>
        <ComparisonErrorBanner
          errorType={bundleCompareType}
          reportType={ReportUploadType.BUNDLE_ANALYSIS}
        />
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

  // we can set team plan true here because we don't care about the fields it will skip - tho we should really stop doing this and just return null on the API if they're on a team plan so we can save on requests made
  const { data } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan: true,
  })

  const bundleCompareType =
    data?.pull?.bundleAnalysisCompareWithBase?.__typename
  const headHasBundle =
    data?.pull?.head?.bundleAnalysis?.bundleAnalysisReport?.__typename ===
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
