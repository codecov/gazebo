import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoOverview } from 'services/repo'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'

const PullBundleAnalysisTable = lazy(() => import('./PullBundleAnalysisTable'))

interface URLParams {
  provider: string
  owner: string
  repo: string
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const PullBundleAnalysis: React.FC = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useRepoOverview({ provider, owner, repo })

  if (data?.coverageEnabled && data?.bundleAnalysisEnabled) {
    return (
      <Suspense fallback={<Loader />}>
        <PullBundleAnalysisTable />
      </Suspense>
    )
  }

  return (
    <>
      <p className="flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4 text-base">
        <BundleMessage />
      </p>
      <Suspense fallback={<Loader />}>
        <PullBundleAnalysisTable />
      </Suspense>
    </>
  )
}

export default PullBundleAnalysis
