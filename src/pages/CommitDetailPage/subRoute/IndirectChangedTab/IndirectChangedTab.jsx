import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const IndirectChangedTable = lazy(() => import('./IndirectChangedTable'))

const Loader = () => (
  <div className="m-4 flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function IndirectChangedTab() {
  return (
    <Suspense fallback={<Loader />}>
      <IndirectChangedTable />
    </Suspense>
  )
}

export default IndirectChangedTab
