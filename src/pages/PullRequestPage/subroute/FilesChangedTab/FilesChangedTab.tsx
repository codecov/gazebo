import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

const FilesChangedTable = lazy(() => import('./FilesChanged'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
}

function FilesChangedTab() {
  const { provider, owner } = useParams<URLParams>()

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const { data: tierData, isLoading } = useTier({ provider, owner })

  if (isLoading) {
    return <Loader />
  }

  if (tierData === 'team' && multipleTiers) {
    return <Suspense fallback={<Loader />}>Hi</Suspense>
  }

  return (
    <Suspense fallback={<Loader />}>
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChangedTab
