import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import GraphToken from './GraphToken'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  return (
    <div className="flex flex-col gap-6">
      {data?.repository?.uploadToken && (
        <RepoUploadToken uploadToken={data?.repository?.uploadToken} />
      )}
      {data?.repository?.defaultBranch && (
        <DefaultBranch defaultBranch={data?.repository?.defaultBranch} />
      )}
      {data?.repository?.profilingToken && (
        <ImpactAnalysisToken
          profilingToken={data?.repository?.profilingToken}
        />
      )}
      {data?.repository?.graphToken && (
        <GraphToken
          graphToken={data?.repository?.graphToken}
        />
      )}
    </div>
  )
}

export default GeneralTab
