import config from 'config'

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
      {!config.IS_SELF_HOSTED && (
        <StaticAnalysisToken
          staticAnalysisToken={repository?.staticAnalysisToken}
        />
      )}
    </>
  )
}

export default Tokens
