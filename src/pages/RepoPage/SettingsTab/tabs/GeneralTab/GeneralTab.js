import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  return (
    <div className="flex flex-col gap-4">
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
    </div>
  )
}

export default GeneralTab
