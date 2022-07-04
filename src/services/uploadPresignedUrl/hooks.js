import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

function getPathUploadPresignedUrl({ provider, owner, repo, pathUrl }) {
  return `/${provider}/${owner}/${repo}/download?path=${pathUrl}`
}

function fetchUploadPresignedUrl({ provider, owner, repo, pathUrl }) {
  const path = getPathUploadPresignedUrl({ provider, owner, repo, pathUrl })
  return Api.get({ path, provider }, { useUploadPath: true })
}

export function useUploadPresignedUrl({ pathUrl }) {
  const { provider, owner, repo } = useParams()
  return useQuery(
    ['uploadPresignedUrl', provider, owner, repo, pathUrl],
    () => {
      return fetchUploadPresignedUrl({ provider, owner, repo, pathUrl })
    }
  )
}
