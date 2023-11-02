import { useParams } from 'react-router-dom'

import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import HeaderDefault from './HeaderDefault'
import HeaderTeam from './HeaderTeam'

interface URLParams {
  provider: string
  owner: string
}

function Header() {
  const { provider, owner } = useParams<URLParams>()
  const { data: tierData } = useTier({ provider, owner })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: repoSettingsTeam } = useRepoSettingsTeam()

  const showHeaderTeam =
    repoSettingsTeam?.repository?.private &&
    multipleTiers &&
    tierData === TierNames.TEAM

  if (showHeaderTeam) {
    return <HeaderTeam />
  }

  return <HeaderDefault />
}

export default Header
