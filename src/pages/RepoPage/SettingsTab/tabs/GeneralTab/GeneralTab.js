import { useParams } from 'react-router-dom'

import { useRepo } from 'services/repo'

import RepoUploadToken from './RepoUploadToken'

function GeneralTab() {
  const { provider, owner, repo } = useParams()
  const { data } = useRepo({ provider, owner, repo })
  return (
    <>
      {data?.repository?.uploadToken && (
        <RepoUploadToken uploadToken={data?.repository?.uploadToken} />
      )}
    </>
  )
}

export default GeneralTab
