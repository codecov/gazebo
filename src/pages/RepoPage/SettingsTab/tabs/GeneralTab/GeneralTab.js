import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import DefaultBranch from './DefaultBranch'
import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const { uploadToken, defaultBranch } = data?.repository
  return (
    <div className="flex flex-col gap-4">
      {uploadToken && <RepoUploadToken uploadToken={uploadToken} />}
      {defaultBranch && <DefaultBranch defaultBranch={defaultBranch} />}
    </div>
  )
}

export default GeneralTab
