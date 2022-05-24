import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  const uploadToken = data?.repository?.uploadToken
  return <>{uploadToken && <RepoUploadToken uploadToken={uploadToken} />}</>
}

export default GeneralTab
