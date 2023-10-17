import { useParams } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'
import { useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import GraphToken from './GraphToken'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'
import StaticAnalysisToken from './StaticAnalysisToken'

function Tokens() {
  const { provider, owner } = useParams()
  const { data: tierData } = useTier({ provider, owner })
  const { data: repoData } = useRepoSettings()
  const repository = repoData?.repository

  const { staticAnalysisToken: showStaticToken, multipleTiers: isTeamTier } =
    useFlags({
      staticAnalysisToken: false,
      multipleTiers: false,
    })

  if (tierData === 'team' && isTeamTier) {
    return (
      <>
        <h2 className="text-lg font-semibold">Tokens</h2>
        <hr />
        <RepoUploadToken uploadToken={repository?.uploadToken} />
        <GraphToken graphToken={repository?.graphToken} />
      </>
    )
  }

  return (
    <>
      <h2 className="text-lg font-semibold">Tokens</h2>
      <hr />
      <RepoUploadToken uploadToken={repository?.uploadToken} />
      <ImpactAnalysisToken profilingToken={repository?.profilingToken} />
      {showStaticToken && (
        <StaticAnalysisToken
          staticAnalysisToken={repository?.staticAnalysisToken}
        />
      )}
      <GraphToken graphToken={repository?.graphToken} />
    </>
  )
}

export default Tokens
