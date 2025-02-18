import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import { useRepoSettingsTeam } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import Spinner from 'ui/Spinner'

import FilesChangedTable from './FilesChangedTable'
import FilesChangedTableTeam from './FilesChangedTableTeam'

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

  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })

  if (isTeamPlan && !!repoSettings?.repository?.private) {
    return (
      <Suspense fallback={<Loader />}>
        <ToggleHeader />
        <FilesChangedTableTeam />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<Loader />}>
      <ToggleHeader />
      <FilesChangedTable />
    </Suspense>
  )
}

export default FilesChanged
