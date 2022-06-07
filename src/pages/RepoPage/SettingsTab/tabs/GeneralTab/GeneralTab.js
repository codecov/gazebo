import { useRepoSettings } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import GraphToken from './GraphToken'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { data } = useRepoSettings()
  const repository = data?.repository

  return (
    <div className="flex flex-col gap-6">
      {repository?.uploadToken && (
        <RepoUploadToken uploadToken={repository?.uploadToken} />
      )}
      {repository?.defaultBranch && (
        <DefaultBranch defaultBranch={repository?.defaultBranch} />
      )}
      {repository?.profilingToken && (
        <ImpactAnalysisToken profilingToken={repository?.profilingToken} />
      )}
      {repository?.graphToken && (
        <GraphToken graphToken={repository?.graphToken} />
      )}
    </div>
  )
}

export default GeneralTab
