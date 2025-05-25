import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { useIsTeamPlan } from 'services/useIsTeamPlan'

import DangerZone from './DangerZone'
import DefaultBranch from './DefaultBranch'
import { RepoForTokensTeamQueryOpts } from './queries/RepoForTokensTeamQueryOpts'
import { Tokens, TokensTeam } from './Tokens'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

function GeneralTab() {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: repoData } = useSuspenseQueryV5(
    RepoForTokensTeamQueryOpts({
      provider,
      owner,
      repo,
    })
  )

  const defaultBranch = repoData?.defaultBranch
  const isPrivate = repoData?.private
  const showTokensTeam = isPrivate && isTeamPlan

  return (
    <div className="flex flex-col gap-6 lg:w-3/4">
      {defaultBranch && <DefaultBranch defaultBranch={defaultBranch} />}
      {showTokensTeam ? <TokensTeam /> : <Tokens />}
      <DangerZone />
    </div>
  )
}

export default GeneralTab
