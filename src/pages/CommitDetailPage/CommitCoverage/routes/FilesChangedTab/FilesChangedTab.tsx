import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import ComponentsSelector from '../ComponentsSelector'

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
  const { data: repoSettings } = useRepoSettingsTeam()

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const { data: tierData } = useTier({ provider, owner })

  if (
    tierData === TierNames.TEAM &&
    !!repoSettings?.repository.private &&
    multipleTiers
  ) {
    return (
      <Suspense fallback={<Loader />}>
        <FilesChangedTableTeam />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <div className="flex justify-end bg-ds-gray-primary p-2">
        <ComponentsSelector />
      </div>
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChanged
