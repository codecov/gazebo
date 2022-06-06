import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import { ActivationStatusContext } from './Context'
import DangerZone from './DangerZone'
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
      {repository?.graphToken && (
        <GraphToken graphToken={repository?.graphToken} />
      )}
      <ActivationStatusContext.Provider value={repository?.active}>
        <DangerZone />
      </ActivationStatusContext.Provider>
    </div>
  )
}

export default GeneralTab
