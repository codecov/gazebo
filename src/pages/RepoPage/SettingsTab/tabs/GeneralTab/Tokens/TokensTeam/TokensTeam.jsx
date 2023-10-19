import { useRepoSettingsTeam } from 'services/repo'

import GraphToken from '../GraphToken'
import RepoUploadToken from '../RepoUploadToken'

function TokensTeam() {
  const { data: repoData } = useRepoSettingsTeam()
  const repository = repoData?.repository

  return (
    <>
      <h2 className="text-lg font-semibold">Tokens</h2>
      <hr />
      <RepoUploadToken uploadToken={repository?.uploadToken} />
      <GraphToken graphToken={repository?.graphToken} />
    </>
  )
}

export default TokensTeam
