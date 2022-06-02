import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import GraphToken from './GraphToken'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
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
      {data?.repository?.graphToken && (
        <GraphToken graphToken={data?.repository?.graphToken} />
      )}
    </div>
  )
}

export default GeneralTab
