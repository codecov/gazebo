import { useParams } from 'react-router-dom'

import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import HeaderDefault from './HeaderDefault'
import HeaderTeam from './HeaderTeam'

function Header() {
  const { provider, owner } = useParams()
  const { data: tierData } = useTier({ provider, owner })
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  if (multipleTiers && tierData === TierNames.TEAM) {
    return <HeaderTeam />
  }

  return <HeaderDefault />
}

export default Header
