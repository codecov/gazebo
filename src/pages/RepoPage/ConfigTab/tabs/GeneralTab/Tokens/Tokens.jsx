import { useRepoSettings } from 'services/repo'
import { useFlags } from 'shared/featureFlags'

import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'
import StaticAnalysisToken from './StaticAnalysisToken'

function Tokens() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  const { staticAnalysisToken: showStaticToken } = useFlags({
    staticAnalysisToken: false,
  })

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
    </>
  )
}

export default Tokens
