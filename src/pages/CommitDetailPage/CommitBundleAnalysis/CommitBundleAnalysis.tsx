import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { CachedBundleContentBanner } from 'shared/CachedBundleContentBanner/CachedBundleContentBanner'
import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import { useFlags } from 'shared/featureFlags'
import { ReportUploadType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
import FirstPullBanner from './FirstPullBanner'

import {
  CommitPageDataQueryOpts,
  TBundleAnalysisComparisonResult,
} from '../queries/CommitPageDataQueryOpts'

const CommitBundleAnalysisTable = lazy(
  () => import('./CommitBundleAnalysisTable')
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  commit: string
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

interface BundleContentProps {
  bundleCompareType?: TBundleAnalysisComparisonResult
  hasCachedBundle: boolean
}

const BundleContent: React.FC<BundleContentProps> = ({
  bundleCompareType,
  hasCachedBundle,
}) => {
  const { displayCachedBundleBanner } = useFlags({
    displayCachedBundleBanner: false,
  })

  if (bundleCompareType === 'FirstPullRequest') {
    return (
      <>
        <FirstPullBanner />
        <EmptyTable />
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
      {hasCachedBundle && displayCachedBundleBanner ? (
        <CachedBundleContentBanner />
      ) : null}
      <Suspense fallback={<Loader />}>
        <CommitBundleAnalysisTable />
      </Suspense>
    </>
  )
}

const CommitBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data: commitPageData } = useSuspenseQueryV5(
    CommitPageDataQueryOpts({
      provider,
      owner,
      repo,
      commitId: commitSha,
    })
  )

  const bundleCompareType =
    commitPageData?.commit?.bundleAnalysis?.bundleAnalysisCompareWithParent
      ?.__typename

  let hasCachedBundle = false
  if (
    commitPageData?.commit?.bundleAnalysis?.bundleAnalysisReport?.__typename ===
    'BundleAnalysisReport'
  ) {
    hasCachedBundle =
      commitPageData?.commit?.bundleAnalysis?.bundleAnalysisReport?.isCached
  }

  if (
    commitPageData?.coverageEnabled &&
    commitPageData?.bundleAnalysisEnabled
  ) {
    return (
      <BundleContent
        bundleCompareType={bundleCompareType}
        hasCachedBundle={hasCachedBundle}
      />
    )
  }

  return (
    <>
      <p className="flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4 text-base">
        <BundleMessage />
      </p>
      <BundleContent
        bundleCompareType={bundleCompareType}
        hasCachedBundle={hasCachedBundle}
      />
    </>
  )
}

export default CommitBundleAnalysis
