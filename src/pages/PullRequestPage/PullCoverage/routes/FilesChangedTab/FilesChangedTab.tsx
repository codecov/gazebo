import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import ToggleHeader from 'pages/PullRequestPage/Header/ToggleHeader/ToggleHeader'
import { useRepoSettingsTeam } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import Spinner from 'ui/Spinner'

import FilesChangedTable from './FilesChanged'
import TeamFilesChangedTable from './FilesChanged/TableTeam'

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

  const { data: repoSettingsTeam } = useRepoSettingsTeam()
  const { data: isTeamPlan, isLoading } = useIsTeamPlan({ provider, owner })

  if (isLoading) {
    return <Loader />
  }

  if (isTeamPlan && repoSettingsTeam?.repository?.private) {
    return (
      <Suspense fallback={<Loader />}>
        <ToggleHeader />
        <TeamFilesChangedTable />
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

export default FilesChangedTab
