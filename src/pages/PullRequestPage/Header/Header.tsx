import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'

import HeaderDefault from './HeaderDefault'
import HeaderTeam from './HeaderTeam'

interface URLParams {
  provider: string
  owner: string
}

function Header() {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData } = useTier({ provider, owner })
  const { data: repoSettingsTeam } = useRepoSettingsTeam()

  if (repoSettingsTeam?.repository?.private && tierData === TierNames.TEAM) {
    return <HeaderTeam />
  }

  return <HeaderDefault />
}

export default Header
