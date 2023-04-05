import { useRepoSettings } from 'services/repo'

import GraphToken from '../GraphToken'
import ImpactAnalysisToken from '../ImpactAnalysisToken'
import RepoUploadToken from '../RepoUploadToken'

function Tokens() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <>
      <h2 className="text-lg font-semibold">Tokens</h2>
      <RepoUploadToken uploadToken={repository?.uploadToken} />
      <ImpactAnalysisToken profilingToken={repository?.profilingToken} />
      <GraphToken graphToken={repository?.graphToken} />
    </>
  )
}

export default Tokens
