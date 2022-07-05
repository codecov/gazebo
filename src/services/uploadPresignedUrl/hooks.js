import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'


function fetchUploadPresignedUrl({ provider, path }) {
  return Api.get({ path, provider }, { useUploadPath: true })
}

export function useUploadPresignedUrl({ path }) {
  const { provider } = useParams()
  return useQuery(
    ['uploadPresignedUrl', provider],
    () => {
      return fetchUploadPresignedUrl({ provider, path })
    }
  )
}
