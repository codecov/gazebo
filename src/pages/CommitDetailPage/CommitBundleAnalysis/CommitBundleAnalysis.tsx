import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const CommitBundleAnalysisTable = lazy(
  () => import('./CommitBundleAnalysisTable')
)

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const CommitBundleAnalysis: React.FC = () => {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <CommitBundleAnalysisTable />
      </Suspense>
    </>
  )
}

export default CommitBundleAnalysis
