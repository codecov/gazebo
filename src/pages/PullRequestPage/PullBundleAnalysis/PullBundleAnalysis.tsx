import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const PullBundleAnalysisTable = lazy(() => import('./PullBundleAnalysisTable'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const PullBundleAnalysis: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <PullBundleAnalysisTable />
    </Suspense>
  )
}

export default PullBundleAnalysis
