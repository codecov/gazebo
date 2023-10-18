import { useParams } from 'react-router-dom'

import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import DangerZone from './DangerZone'
import DefaultBranch from './DefaultBranch'
import { useRepoDefaultBranch } from './hooks'
import { Tokens, TokensTeam } from './Tokens'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data: defaultBranch } = useRepoDefaultBranch({
    provider,
    owner,
    repo,
  })
  const { data: tierData } = useTier({ provider, owner })

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  return (
    <div className="flex flex-col gap-6">
      {defaultBranch && <DefaultBranch defaultBranch={defaultBranch} />}
      {tierData === TierNames.TEAM && multipleTiers ? (
        <TokensTeam />
      ) : (
        <Tokens />
      )}
      <DangerZone />
    </div>
  )
}

export default GeneralTab
