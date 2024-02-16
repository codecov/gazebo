import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'
import EmptyTable from './EmptyTable'
import ErrorBanner from './ErrorBanner'
import FirstPullBanner from './FirstPullBanner'

import { TBundleAnalysisComparisonResult, usePullPageData } from '../hooks'

const PullBundleAnalysisTable = lazy(() => import('./PullBundleAnalysisTable'))

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
        <ErrorBanner errorType={bundleCompareType} />
        <EmptyTable />
      </>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <PullBundleAnalysisTable />
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

  if (data?.coverageEnabled && data?.bundleAnalysisEnabled) {
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

export default PullBundleAnalysis
