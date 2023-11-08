import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import Spinner from 'ui/Spinner'

const CommitsTable = lazy(() => import('./CommitsTable'))
const CommitsTableTeam = lazy(() => import('./CommitsTableTeam'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function CommitsTab() {
  const { provider, owner } = useParams()
  const { data: tierName } = useTier({ provider, owner })
  const { data: repoData } = useRepoSettingsTeam()

  const showTeamTable =
    tierName === TierNames.TEAM && repoData?.repository?.private

  return (
    <Suspense fallback={<Loader />}>
      {showTeamTable ? <CommitsTableTeam /> : <CommitsTable />}
    </Suspense>
  )
}

export default CommitsTab
