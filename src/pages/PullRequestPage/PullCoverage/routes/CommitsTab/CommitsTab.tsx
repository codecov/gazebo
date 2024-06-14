import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const CommitsTable = lazy(() => import('./CommitsTable'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CommitsTab() {
  return (
    <Suspense fallback={<Loader />}>
      <CommitsTable />
    </Suspense>
  )
}

export default CommitsTab
