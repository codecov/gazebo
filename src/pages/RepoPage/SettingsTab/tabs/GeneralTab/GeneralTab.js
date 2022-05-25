import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const uploadToken = data?.repository?.uploadToken
  return (
    <div>{uploadToken && <RepoUploadToken uploadToken={uploadToken} />}</div>
  )
}

export default GeneralTab
