import { useRepoSettings } from 'services/repo'

import RepoUploadToken from './RepoUploadToken'
import StaticAnalysisToken from './StaticAnalysisToken'

function Tokens() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <>
      <h2 className="text-lg font-semibold">Tokens</h2>
      <hr />
      <RepoUploadToken uploadToken={repository?.uploadToken} />
      <StaticAnalysisToken
        staticAnalysisToken={repository?.staticAnalysisToken}
      />
    </>
  )
}

export default Tokens
