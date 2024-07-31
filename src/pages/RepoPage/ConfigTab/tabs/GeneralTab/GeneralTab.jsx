import { useParams } from 'react-router-dom'

import { TierNames, useTier } from 'services/tier'

import DangerZone from './DangerZone'
import DefaultBranch from './DefaultBranch'
import { useRepoForTokensTeam } from './hooks'
import { Tokens, TokensTeam } from './Tokens'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepoForTokensTeam({
    provider,
    owner,
    repo,
  })
  const { data: tierData } = useTier({ provider, owner })
  const defaultBranch = repoData?.defaultBranch
  const isPrivate = repoData?.private
  const showTokensTeam = isPrivate && tierData === TierNames.TEAM

  return (
    <div className="flex flex-col gap-6 lg:w-3/4">
      {defaultBranch && <DefaultBranch defaultBranch={defaultBranch} />}
      {showTokensTeam ? <TokensTeam /> : <Tokens />}
      <DangerZone />
    </div>
  )
}

export default GeneralTab
