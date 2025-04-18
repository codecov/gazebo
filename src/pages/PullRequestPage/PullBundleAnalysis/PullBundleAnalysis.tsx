import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { CachedBundleContentBanner } from 'shared/CachedBundleContentBanner/CachedBundleContentBanner'
import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import { ReportUploadType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
import FirstPullBanner from './FirstPullBanner'
import PullBundleComparisonTable from './PullBundleComparisonTable'
import PullBundleHeadTable from './PullBundleHeadTable'

import {
  PullPageDataQueryOpts,
  TBundleAnalysisComparisonResult,
} from '../queries/PullPageDataQueryOpts'

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
  headHasBundle: boolean
  hasCachedBundle: boolean
}

const BundleContent: React.FC<BundleContentProps> = ({
  bundleCompareType,
  headHasBundle,
  hasCachedBundle,
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
    <>
      {hasCachedBundle ? <CachedBundleContentBanner /> : null}
      <Suspense fallback={<Loader />}>
        <PullBundleComparisonTable />
      </Suspense>
    </>
  )
}

const PullBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  // we can set team plan true here because we don't care about the fields it will skip - tho we should really stop doing this and just return null on the API if they're on a team plan so we can save on requests made
  const { data } = useSuspenseQueryV5(
    PullPageDataQueryOpts({
      provider,
      owner,
      repo,
      pullId,
      isTeamPlan: true,
    })
  )

  const bundleCompareType =
    data?.pull?.bundleAnalysisCompareWithBase?.__typename

  let headHasBundle = false
  let hasCachedBundle = false
  if (
    data?.pull?.head?.bundleAnalysis?.bundleAnalysisReport?.__typename ===
    'BundleAnalysisReport'
  ) {
    headHasBundle = true
    hasCachedBundle =
      data?.pull?.head?.bundleAnalysis?.bundleAnalysisReport?.isCached
  }

  if (data?.coverageEnabled && data?.bundleAnalysisEnabled) {
    return (
      <BundleContent
        bundleCompareType={bundleCompareType}
        headHasBundle={headHasBundle}
        hasCachedBundle={hasCachedBundle}
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
        hasCachedBundle={hasCachedBundle}
      />
    </>
  )
}

export default PullBundleAnalysis
