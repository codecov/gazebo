import { useParams } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import DangerZone from './DangerZone'
import DefaultBranch from './DefaultBranch'
import { Tokens, TokensTeam } from './Tokens'

function GeneralTab() {
  const { data } = useRepoSettings()
  const { provider, owner } = useParams()
  const { data: tierData } = useTier({ provider, owner })

  const { multipleTiers: isTeamTier } = useFlags({
    multipleTiers: false,
  })

  const repository = data?.repository

  return (
    <div className="flex flex-col gap-6">
      {repository?.defaultBranch && (
        <DefaultBranch defaultBranch={repository?.defaultBranch} />
      )}
      {tierData === TierNames.TEAM && isTeamTier ? <TokensTeam /> : <Tokens />}
      <DangerZone />
    </div>
  )
}

export default GeneralTab
