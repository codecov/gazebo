import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'

import HeaderDefault from './HeaderDefault'
import HeaderTeam from './HeaderTeam'

interface URLParams {
  provider: string
  owner: string
}

function Header() {
  const { provider, owner } = useParams<URLParams>()
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: repoSettingsTeam } = useRepoSettingsTeam()

  if (repoSettingsTeam?.repository?.private && isTeamPlan) {
    return <HeaderTeam />
  }

  return <HeaderDefault />
}

export default Header
