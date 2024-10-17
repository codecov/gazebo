import { lazy, Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import { ReportUploadType } from 'shared/utils/comparison'
import { metrics } from 'shared/utils/metrics'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
import FirstPullBanner from './FirstPullBanner'

import { TBundleAnalysisComparisonResult, useCommitPageData } from '../hooks'

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
}

const BundleContent: React.FC<BundleContentProps> = ({ bundleCompareType }) => {
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
    <Suspense fallback={<Loader />}>
      <CommitBundleAnalysisTable />
    </Suspense>
  )
}

const CommitBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: commitPageData } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commitSha,
  })

  useEffect(() => {
    if (overview?.bundleAnalysisEnabled && overview?.coverageEnabled) {
      metrics.increment('commit_detail_page.bundle_dropdown.opened', 1)
    } else if (overview?.bundleAnalysisEnabled) {
      metrics.increment('commit_detail_page.bundle_page.visited_page', 1)
    }
  }, [overview?.bundleAnalysisEnabled, overview?.coverageEnabled])

  const bundleCompareType =
    commitPageData?.commit?.bundleAnalysis?.bundleAnalysisCompareWithParent
      ?.__typename

  if (
    commitPageData?.coverageEnabled &&
    commitPageData?.bundleAnalysisEnabled
  ) {
    return <BundleContent bundleCompareType={bundleCompareType} />
  }

  return (
    <>
      <p className="flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4 text-base">
        <BundleMessage />
      </p>
      <BundleContent bundleCompareType={bundleCompareType} />
    </>
  )
}

export default CommitBundleAnalysis
