import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import GraphToken from './GraphToken'
import ImpactAnalysisToken from './ImpactAnalysisToken'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { uploadToken, defaultBranch, profilingToken, graphToken } = data?.repository
  return (
    <div className="flex flex-col gap-6">
      {uploadToken && (
        <RepoUploadToken uploadToken={uploadToken} />
      )}
      {defaultBranch && (
        <DefaultBranch defaultBranch={defaultBranch} />
      )}
      {profilingToken && (
        <ImpactAnalysisToken
          profilingToken={profilingToken}
        />
      )}
      {graphToken && (
        <GraphToken
          graphToken={graphToken}
        />
      )}
    </div>
  )
}

export default GeneralTab
