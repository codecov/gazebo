import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

const FilesChangedTable = lazy(() => import('./FilesChangedTable'))
const FilesChangedTableTeam = lazy(() => import('./FilesChangedTableTeam'))

const Loader = () => (
  <div className="flex flex-1 justify-center p-4">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
}

function FilesChanged() {
  const { provider, owner } = useParams<URLParams>()

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const { data: tierData } = useTier({ provider, owner })

  if (tierData === 'team' && multipleTiers) {
    return (
      <Suspense fallback={<Loader />}>
        <FilesChangedTableTeam />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChanged
