import { lazy, Suspense } from 'react'

import Spinner from 'ui/Spinner'

const FilesChangedTable = lazy(() => import('./FilesChangeTable'))

const Loader = () => (
  <div className="m-4 flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function FilesChanged() {
  return (
    <Suspense fallback={<Loader />}>
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChanged
