import { Suspense } from 'react'

import Spinner from 'ui/Spinner'

import IndirectChangesTable from './IndirectChangesTable'

const Loader = () => (
  <div className="m-4 flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function IndirectChangesTab() {
  return (
    <Suspense fallback={<Loader />}>
      <IndirectChangesTable />
    </Suspense>
  )
}

export default IndirectChangesTab
