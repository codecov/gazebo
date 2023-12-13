import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import ComponentsSelector from '../ComponentsSelector'

const FilesChangedTable = lazy(() => import('./FilesChanged'))
const TeamFilesChangedTable = lazy(() => import('./FilesChanged/TableTeam'))

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

  const { multipleTiers, componentsSelect } = useFlags({
    multipleTiers: false,
    componentsSelect: false,
  })
  const { data: repoSettingsTeam } = useRepoSettingsTeam()
  const { data: tierData, isLoading } = useTier({ provider, owner })

  if (isLoading) {
    return <Loader />
  }

  if (
    multipleTiers &&
    tierData === TierNames.TEAM &&
    repoSettingsTeam?.repository?.private
  ) {
    return (
      <Suspense fallback={<Loader />}>
        <TeamFilesChangedTable />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      {componentsSelect && (
        <div className="flex justify-end bg-ds-gray-primary p-2">
          <ComponentsSelector />
        </div>
      )}
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChangedTab
