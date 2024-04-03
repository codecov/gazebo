import { lazy, Suspense } from 'react'

import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import Spinner from 'ui/Spinner'

const IndirectChangesTable = lazy(() => import('./IndirectChangesTable'))

const Loader = () => (
  <div className="m-4 flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function IndirectChangesTab() {
  return (
    <Suspense fallback={<Loader />}>
      <ToggleHeader />
      <IndirectChangesTable />
    </Suspense>
  )
}

export default IndirectChangesTab
